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
import {
  generateRandomNumber,
  sha256,
  buildExtraData,
  DEFAULT_EXTRA_DATA_STR,
} from "./util";

const DEFAULT_CONTENT_TOPIC = "/js-waku-examples/1/message-ratio/utf8";
const DEFAULT_PUBSUB_TOPIC = utils.contentTopicToPubsubTopic(
  DEFAULT_CONTENT_TOPIC
);
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

async function wakuNode(): Promise<LightNode> {
  let seed = localStorage.getItem("seed");

  if (!seed) {
    seed = (await sha256(generateRandomNumber())).slice(0, 32);
    localStorage.setItem("seed", seed);
  }

  const privateKey = await generateKeyPairFromSeed("Ed25519", fromString(seed));

  return createLightNode({
    networkConfig: {
      contentTopics: [DEFAULT_CONTENT_TOPIC],
    },
    numPeersToUse: 2,
    defaultBootstrap: true,
    libp2p: {
      privateKey,
    },
  });
}

export async function app(telemetryClient: TelemetryClient) {
  const node = await wakuNode();
  (window as any).waku = node;

  console.log("DEBUG: your peer ID is:", node.libp2p.peerId.toString());

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
        peerId,
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
        const messageHash = await sha256(
          `${sequenceHash}-${sequenceIndex}-${sequenceTotal}`
        );

        const timestamp = Math.floor(new Date().getTime() / 1000);
        const message = ProtoSequencedMessage.create({
          hash: messageHash,
          total: sequenceTotal,
          index: sequenceIndex,
          sender: peerId,
        });
        const payload = ProtoSequencedMessage.encode(message).finish();

        const result = await node.lightPush.send(
          encoder,
          {
            payload,
            timestamp: new Date(),
          },
          { autoRetry: true }
        );

        console.log("DEBUG: light push successes: ", result.successes.length);
        console.log(
          "DEBUG: light push failures: ",
          result.failures.length
        );

        // Increment sequence
        sequenceIndex++;

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

    const subscriptionCallback = async (message: DecodedMessage) => {
      const decodedMessage: any = ProtoSequencedMessage.decode(
        message.payload
      );

      if (decodedMessage.sender === peerId) {
        return;
      }

      const timestamp = Math.floor(new Date().getTime() / 1000);

      const messageElement = document.createElement("div");
      messageElement.textContent = `Message: ${decodedMessage.hash}`;
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

  startFilterSubscription();

  document.addEventListener(sequenceCompletedEvent.type, () =>
    startLightPushSequence(10, 3000)
  );

  startLightPushSequence(10, 3000);
})();