import {
  createLightNode,
  createEncoder,
  createDecoder,
  DecodedMessage,
  waitForRemotePeer,
  LightNode,
  utils,
} from "@waku/sdk";

import { Type, Field } from "protobufjs";
import {
  TelemetryClient,
  TelemetryPushFilter,
  TelemetryType,
} from "./telemetry_client";
import { generateRandomNumber, sha256 } from "./util";

const DEFAULT_CONTENT_TOPIC = "/js-waku-examples/1/message-ratio/utf8";
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
  return await createLightNode({
    networkConfig: {
      contentTopics: [DEFAULT_CONTENT_TOPIC],
    },
    defaultBootstrap: true,
  });
};

export async function app(telemetryClient: TelemetryClient) {
  const node = await wakuNode();
  await node.start();

  await waitForRemotePeer(node);

  const peerId = node.libp2p.peerId.toString();
  const encoder = createEncoder({
    contentTopic: DEFAULT_CONTENT_TOPIC,
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
        const reportingHash = await sha256(`${sequenceHash}-${sequenceIndex}-${sequenceTotal}`);

        const timestamp = Math.floor(new Date().getTime() / 1000);
        const message = ProtoSequencedMessage.create({
          hash: reportingHash,
          seqHash: sequenceHash,
          total: sequenceTotal,
          index: sequenceIndex,
          sender: peerId,
        });
        const payload = ProtoSequencedMessage.encode(message).finish();
        const result = await node.lightPush.send(encoder, {
          payload,
          timestamp: new Date(),
        });

        console.log("===");
        console.log("light push successes: ", result.successes.length);
        console.log(result.successes);
        console.log("light push failures: ", result.failures.length);
        console.log(result.failures);

        if (result.successes.length > 0) {
          // Push to telemetry client
          telemetryClient.push<TelemetryPushFilter>([
            {
              type: TelemetryType.LIGHT_PUSH_FILTER,
              protocol: "lightPush",
              timestamp: timestamp,
              createdAt: timestamp,
              seenTimestamp: timestamp,
              peerId,
              contentTopic: DEFAULT_CONTENT_TOPIC,
              pubsubTopic: utils.contentTopicToPubsubTopic(DEFAULT_CONTENT_TOPIC),
              ephemeral: false,
              messageHash: reportingHash,
              errorMessage: "",
              extraData: "",
            }
          ]);

          // Update ui
          const messageElement = document.createElement("div");
          const messagesSent = document.getElementById("messagesSent");
          messageElement.textContent = `Message: ${sequenceHash} ${sequenceIndex} of ${sequenceTotal}`;
          messagesSent.insertBefore(messageElement, messagesSent.firstChild);
          messagesSent.insertBefore(
            document.createElement("br"),
            messagesSent.firstChild
          );

          document.dispatchEvent(messageSentEvent);

          // Increment sequence
          sequenceIndex++;
        }
        if (result.failures.length > 0) {
          telemetryClient.push<TelemetryPushFilter>(
            result.failures.map((failure) => ({
              type: TelemetryType.LIGHT_PUSH_FILTER,
              protocol: "lightPush",
              timestamp: timestamp,
              createdAt: timestamp,
              seenTimestamp: timestamp,
              peerId,
              contentTopic: DEFAULT_CONTENT_TOPIC,
              pubsubTopic: utils.contentTopicToPubsubTopic(DEFAULT_CONTENT_TOPIC),
              ephemeral: false,
              messageHash: reportingHash,
              errorMessage: failure.error.toString(),
              extraData: "",
            }))
          );
        }
        if (sequenceIndex < sequenceTotal) {
          setTimeout(sendMessage, period); // Schedule the next send
        } else {
          document.dispatchEvent(sequenceCompletedEvent);
        }
      } catch (error) {
        console.error("Error sending message", error);
      }
    };

    sendMessage(); // Start the recursive sending
  };

  const startFilterSubscription = async () => {
    const decoder = createDecoder(DEFAULT_CONTENT_TOPIC);

    const messagesReceived = document.getElementById("messagesReceived");
    const subscriptionCallback = (message: DecodedMessage) => {
      const decodedMessage: any = ProtoSequencedMessage.decode(
        message.payload
      );

      // Don't bother reporting messages sent by this same node
      if (decodedMessage.sender === peerId) {
        return;
      }

      const timestamp = Math.floor(new Date().getTime() / 1000);
      telemetryClient.push<TelemetryPushFilter>([
        {
          type: TelemetryType.LIGHT_PUSH_FILTER,
          protocol: "filter",
          timestamp,
          createdAt: Math.floor(message.timestamp.getTime() / 1000),
          seenTimestamp: timestamp,
          peerId: decodedMessage.sender,
          contentTopic: message.contentTopic,
          pubsubTopic: message.pubsubTopic,
          ephemeral: message.ephemeral,
          messageHash: decodedMessage.hash,
          errorMessage: "",
          extraData: "",
        },
      ]);

      const messageElement = document.createElement("div");
      messageElement.textContent = `Message: ${decodedMessage.hash} ${decodedMessage.index} of ${decodedMessage.total}`;
      messagesReceived.appendChild(messageElement);
      messagesReceived.appendChild(document.createElement("br"));

      document.dispatchEvent(messageReceivedEvent);
    };

    await node.filter.subscribe(decoder, subscriptionCallback);
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
  (window as any).waku = node;

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
    const messagePeriod = Math.floor(Math.random() * 2001) + 5000;
    startLightPushSequence(numMessages, messagePeriod);
  }

  document.addEventListener(sequenceCompletedEvent.type, () => startSequence());
  startSequence();
})();