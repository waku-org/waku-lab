import {
  createLightNode,
  createEncoder,
  createDecoder,
  DecodedMessage,
  LightNode,
  utils,
} from "@waku/sdk";
import { generateKeyPairFromSeed } from "@libp2p/crypto/keys";
import { fromString } from "uint8arrays";

import { Type, Field } from "protobufjs";
import {
  TelemetryClient,
  TelemetryPushFilter,
  TelemetryType,
} from "./telemetry_client";
import { generateRandomNumber, sha256, buildExtraData, DEFAULT_EXTRA_DATA_STR } from "./util";

const DEFAULT_CONTENT_TOPIC = "/js-waku-examples/1/message-ratio/utf8";
const DEFAULT_PUBSUB_TOPIC = utils.contentTopicToPubsubTopic(DEFAULT_CONTENT_TOPIC);
const TELEMETRY_URL =
  process.env.TELEMETRY_URL || "http://localhost:8080/waku-metrics";

const ProtoSequencedMessage = new Type("SequencedMessage")
  .add(new Field("hash", 1, "string"))
  .add(new Field("total", 2, "uint64"))
  .add(new Field("index", 3, "uint64"))
  .add(new Field("sender", 4, "string"));

const sequenceCompletedEvent = new CustomEvent("sequenceCompleted");
const messageSentEvent = new CustomEvent("messageSent");
const messageReceivedEvent = new CustomEvent("messageReceived");

const wakuNode = async (): Promise<LightNode> => {
  let seed = localStorage.getItem("seed");

  if (!seed) {
    seed = (await sha256(generateRandomNumber())).slice(0, 32)
    localStorage.setItem("seed", seed);
  }

  const privateKey = await generateKeyPairFromSeed("Ed25519", fromString(seed));

  return await createLightNode({
    networkConfig: {
      contentTopics: [DEFAULT_CONTENT_TOPIC],
    },
    numPeersToUse: 2,
    defaultBootstrap: true,
    libp2p: {
      privateKey: privateKey
    },
    // filter: { enableLightPushFilterCheck: true }
  });
};

export async function app(telemetryClient: TelemetryClient) {
  const node = await wakuNode();
  (window as any).waku = node;

  console.log("DEBUG: your peer ID is:", node.peerId.toString());
  
  await node.start();
  await node.waitForPeers();

  const peerId = node.libp2p.peerId.toString();
  const encoder = createEncoder({
    contentTopic: DEFAULT_CONTENT_TOPIC,
  });

  node.libp2p.addEventListener("peer:discovery", async (event) => {
    const discoveredPeerId = event.detail.id.toString();

    const timestamp = Math.floor(new Date().getTime() / 1000);
    const extraData = await buildExtraData(node, discoveredPeerId);
    const hash = await sha256(`${peerId}-${discoveredPeerId}-${timestamp}`);

    telemetryClient.push<TelemetryPushFilter>([
      {
        type: TelemetryType.LIGHT_PUSH_FILTER,
        protocol: "discovery",
        timestamp,
        createdAt: timestamp,
        seenTimestamp: timestamp,
        peerId: peerId,
        contentTopic: DEFAULT_CONTENT_TOPIC,
        pubsubTopic: DEFAULT_PUBSUB_TOPIC,
        ephemeral: false,
        messageHash: hash,
        errorMessage: "",
        extraData,
      },
    ]);
  });

  const startLightPushSequence = async (
    numMessages: number,
    period: number = 3000
  ) => {
    const sequenceHash = await sha256(generateRandomNumber());
    const sequenceTotal = numMessages;
    let sequenceIndex = 0;

    const sendMessage = async () => {
      try {
        // TODO(weboko): replace with @waku/message-hash ideally
        const messageHash = await sha256(`${sequenceHash}-${sequenceIndex}-${sequenceTotal}`);

        const timestamp = Math.floor(new Date().getTime() / 1000);
        const message = ProtoSequencedMessage.create({
          hash: messageHash,
          seqHash: sequenceHash,
          total: sequenceTotal,
          index: sequenceIndex,
          sender: peerId,
        });
        const payload = ProtoSequencedMessage.encode(message).finish();
        const result = await node.lightPush.send(encoder, {
          payload,
          timestamp: new Date(),
        }, {autoRetry: true });

        console.log("DEBUG: light push successes: ", result?.successes?.length, result?.successes.map(p => p.toString()));
        console.log("DEBUG: light push failures: ", result?.failures?.length, result?.failures.map(f => ({ error: f.error, peerId: f?.peerId?.toString()})));

        const successEvents = result
          .successes
          .map(async (peerId) => {
            const extraData = await buildExtraData(node, peerId.toString());
            return {
              type: TelemetryType.LIGHT_PUSH_FILTER,
              protocol: "lightPush",
              timestamp: timestamp,
              createdAt: timestamp,
              seenTimestamp: timestamp,
              peerId: peerId.toString(),
              contentTopic: DEFAULT_CONTENT_TOPIC,
              pubsubTopic: DEFAULT_PUBSUB_TOPIC,
              ephemeral: false,
              messageHash: messageHash,
              errorMessage: "",
              extraData,
            };
          });
        
        const failureEvents = (result.failures || [])
          .map(async (fail) => {
            const extraData = await buildExtraData(node, fail?.peerId?.toString());
            return {
              type: TelemetryType.LIGHT_PUSH_FILTER,
              protocol: "lightPush",
              timestamp: timestamp,
              createdAt: timestamp,
              seenTimestamp: timestamp,
              peerId: fail?.peerId?.toString(),
              contentTopic: DEFAULT_CONTENT_TOPIC,
              pubsubTopic: DEFAULT_PUBSUB_TOPIC,
              ephemeral: false,
              messageHash: messageHash,
              errorMessage: fail.error.toString(),
              extraData,
            };
          });
        
        const events = await Promise.all([
          ...successEvents,
          ...failureEvents,
        ]);

        if (events.length > 0) {
          telemetryClient.push<TelemetryPushFilter>(events);
        }

        if (result?.successes?.length > 0) {
          // Update ui
          const messageElement = document.createElement("div");
          const messagesSent = document.getElementById("messagesSent");
          messageElement.textContent = `Message: ${messageHash} ${sequenceIndex} of ${sequenceTotal}`;
          messagesSent.insertBefore(messageElement, messagesSent.firstChild);
          messagesSent.insertBefore(
            document.createElement("br"),
            messagesSent.firstChild
          );

          document.dispatchEvent(messageSentEvent);

          // Increment sequence
          sequenceIndex++;
        }
        if (sequenceIndex < sequenceTotal) {
          setTimeout(sendMessage, period); // Schedule the next send
        } else {
          document.dispatchEvent(sequenceCompletedEvent);
        }
      } catch (error) {
        console.error("DEBUG: Error sending message", error);
      }
    };

    sendMessage(); // Start the recursive sending
  };

  const startFilterSubscription = async () => {
    const decoder = createDecoder(DEFAULT_CONTENT_TOPIC);

    const messagesReceived = document.getElementById("messagesReceived");
    const subscriptionCallback = async (message: DecodedMessage) => {
      const decodedMessage: any = ProtoSequencedMessage.decode(
        message.payload
      );

      // Don't bother reporting messages sent by this same node
      if (decodedMessage.sender === peerId) {
        return;
      }

      const extraData = await buildExtraData(node, decodedMessage.sender);
      const timestamp = Math.floor(new Date().getTime() / 1000);
      telemetryClient.push<TelemetryPushFilter>([
        {
          type: TelemetryType.LIGHT_PUSH_FILTER,
          protocol: "filter",
          timestamp,
          createdAt: Math.floor(message.timestamp.getTime() / 1000),
          seenTimestamp: timestamp,
          peerId: peerId,
          contentTopic: message.contentTopic,
          pubsubTopic: message.pubsubTopic,
          ephemeral: message.ephemeral,
          messageHash: decodedMessage.hash,
          errorMessage: "",
          extraData,
        },
      ]);

      const messageElement = document.createElement("div");
      messageElement.textContent = `Message: ${decodedMessage.hash} ${decodedMessage.index} of ${decodedMessage.total}`;
      messagesReceived.appendChild(messageElement);
      messagesReceived.appendChild(document.createElement("br"));

      document.dispatchEvent(messageReceivedEvent);
    };

    const result = await node.filter.subscribe(decoder, subscriptionCallback);

    let errorEvent = [];
    if (result.error) {
      const timestamp = Math.floor(new Date().getTime() / 1000);
      errorEvent.push({
        type: TelemetryType.LIGHT_PUSH_FILTER,
        protocol: "filterCreateSubscription",
        timestamp,
        createdAt: timestamp,
        seenTimestamp: timestamp,
        peerId: peerId,
        contentTopic: DEFAULT_CONTENT_TOPIC,
        pubsubTopic: DEFAULT_PUBSUB_TOPIC,
        ephemeral: false,
        messageHash: await sha256(generateRandomNumber()),
        errorMessage: result.error,
        extraData: DEFAULT_EXTRA_DATA_STR,
      });
    }
    
    const failEvents = (result.results?.failures || []).map(async (fail) => {
      const extraData = await buildExtraData(node, fail?.peerId?.toString());
      const timestamp = Math.floor(new Date().getTime() / 1000);
      return {
        type: TelemetryType.LIGHT_PUSH_FILTER,
        protocol: "filterCreateSubscription",
        timestamp,
        createdAt: timestamp,
        seenTimestamp: timestamp,
        peerId: fail?.peerId?.toString(),
        contentTopic: DEFAULT_CONTENT_TOPIC,
        pubsubTopic: DEFAULT_PUBSUB_TOPIC,
        ephemeral: false,
        messageHash: await sha256(generateRandomNumber()),
        errorMessage: fail.error,
        extraData,
      };
    });

    const successEvents = (result.results?.successes || []).map(async (peerId) => {
      const extraData = await buildExtraData(node, peerId.toString());
      const timestamp = Math.floor(new Date().getTime() / 1000);
      return {
        type: TelemetryType.LIGHT_PUSH_FILTER,
        protocol: "filterCreateSubscription",
        timestamp,
        createdAt: timestamp,
        seenTimestamp: timestamp,
        peerId: peerId.toString(),
        contentTopic: DEFAULT_CONTENT_TOPIC,
        pubsubTopic: DEFAULT_PUBSUB_TOPIC,
        ephemeral: false,
        messageHash: await sha256(generateRandomNumber()),
        errorMessage: "",
        extraData,
      };
    });

    const resolvedEvents = await Promise.all([
      ...failEvents,
      ...successEvents,
    ]);

    const events = [
      ...errorEvent,
      ...resolvedEvents,
    ];

    if (events.length > 0) {
      telemetryClient.push<TelemetryPushFilter>(events);
    }
  };

  return {
    node,
    startLightPushSequence,
    startFilterSubscription,
  };
}

(async () => {
  const telemetryClient = new TelemetryClient(TELEMETRY_URL, 5000);
  const { node, startLightPushSequence, startFilterSubscription } = await app(
    telemetryClient
  );

  const peerIDBlock = document.getElementById("peerID");
  peerIDBlock.innerText = node.libp2p.peerId.toString();

  const runningScreen = document.getElementById("runningScreen");
  runningScreen.style.display = "block";

  await telemetryClient.start();
  startFilterSubscription();

  let sentMessagesCount = 0;
  const sentMessagesCounter = document.getElementById(
    "numSent"
  ) as HTMLSpanElement;
  document.addEventListener("messageSent", () => {
    sentMessagesCount++;
    sentMessagesCounter.textContent = sentMessagesCount.toString();
  });

  let receivedMessagesCount = 0;
  const receivedMessagesCounter = document.getElementById(
    "numReceived"
  ) as HTMLSpanElement;
  document.addEventListener("messageReceived", () => {
    receivedMessagesCount++;
    receivedMessagesCounter.textContent = receivedMessagesCount.toString();
  });

  function startSequence() {
    const numMessages = Math.floor(Math.random() * 16) + 5;
    const messagePeriod = Math.floor(Math.random() * 2001) + 5_000;
    startLightPushSequence(numMessages, messagePeriod);
  }

  document.addEventListener(sequenceCompletedEvent.type, () => startSequence());
  startSequence();
})();