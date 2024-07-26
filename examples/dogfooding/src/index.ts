import {
  createLightNode,
  createEncoder,
  createDecoder,
  DecodedMessage,
  waitForRemotePeer,
  LightNode,
  utils
} from "@waku/sdk";

import { Type, Field } from "protobufjs";
import {
  TelemetryClient,
  TelemetryPushError,
  TelemetryPushFilter,
  TelemetryType,
} from "./telemetry_client";
import { generateRandomNumber, hashNumber } from "./util";

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

const wakuNode = async (): Promise<LightNode> => {
  return await createLightNode({
    contentTopics: [DEFAULT_CONTENT_TOPIC],
    defaultBootstrap: true,
  });
};

export async function app(telemetryClient: TelemetryClient) {
  const node = await wakuNode();
  await node.start();

  // TODO: https://github.com/waku-org/js-waku/issues/2079
  // Dialing bootstrap peers right on start in order to have Filter subscription initiated properly
  await node.dial("/dns4/node-01.do-ams3.waku.test.status.im/tcp/8000/wss");
  await node.dial(
    "/dns4/node-01.ac-cn-hongkong-c.waku.test.status.im/tcp/8000/wss"
  );
  await node.dial(
    "/dns4/node-01.gc-us-central1-a.waku.test.status.im/tcp/8000/wss"
  );

  await waitForRemotePeer(node);

  const peerId = node.libp2p.peerId.toString();
  const encoder = createEncoder({
    contentTopic: DEFAULT_CONTENT_TOPIC,
  });

  const startLightPushSequence = async (
    numMessages: number,
    period: number = 3000
  ) => {
    const sequenceHash = await hashNumber(generateRandomNumber());
    const sequenceTotal = numMessages;
    let sequenceIndex = 0;

    const sendMessage = async () => {
      try {
        const message = ProtoSequencedMessage.create({
          hash: sequenceHash,
          total: sequenceTotal,
          index: sequenceIndex,
          sender: peerId,
        });
        const payload = ProtoSequencedMessage.encode(message).finish();
        const result = await node.lightPush.send(encoder, {
          payload,
          timestamp: new Date(),
        });
        console.log("light push successes: ", result.successes.length);
        console.log("light push failures: ", result.failures.length);
        if (result.successes.length > 0) {
          // Push to telemetry client
          telemetryClient.push<TelemetryPushFilter>([
            {
              messageType: TelemetryType.LIGHT_PUSH_FILTER,
              timestamp: Math.floor(new Date().getTime() / 1000),
              peerIdSender: peerId,
              peerIdReporter: peerId,
              sequenceHash: sequenceHash,
              sequenceTotal: sequenceTotal,
              sequenceIndex: sequenceIndex,
              contentTopic: DEFAULT_CONTENT_TOPIC,
              pubsubTopic: utils.contentTopicToPubsubTopic(DEFAULT_CONTENT_TOPIC),
            },
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
          telemetryClient.push<TelemetryPushError>(
            result.failures.map((failure) => ({
              messageType: TelemetryType.LIGHT_PUSH_ERROR,
              timestamp: Math.floor(new Date().getTime() / 1000),
              peerId: peerId,
              peerIdRemote: failure.peerId?.toString(),
              errorMessage: failure.error.toString(),
              contentTopic: DEFAULT_CONTENT_TOPIC,
              pubsubTopic: DefaultPubsubTopic,
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
      const sequencedMessage: any = ProtoSequencedMessage.decode(
        message.payload
      );

      // Don't bother reporting messages sent by this same node
      if (sequencedMessage.sender === peerId) {
        return;
      }
      telemetryClient.push<TelemetryPushFilter>([
        {
          messageType: TelemetryType.LIGHT_PUSH_FILTER,
          timestamp: Math.floor(new Date().getTime() / 1000),
          peerIdSender: sequencedMessage.sender,
          peerIdReporter: peerId,
          sequenceHash: sequencedMessage.hash,
          sequenceTotal: sequencedMessage.total,
          sequenceIndex: sequencedMessage.index,
          contentTopic: DEFAULT_CONTENT_TOPIC,
          pubsubTopic: utils.contentTopicToPubsubTopic(DEFAULT_CONTENT_TOPIC),
        },
      ]);

      const messageElement = document.createElement("div");
      messageElement.textContent = `Message: ${sequencedMessage.hash} ${sequencedMessage.index} of ${sequencedMessage.total}`;
      messagesReceived.appendChild(messageElement);
      messagesReceived.appendChild(document.createElement("br"));
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

  function startSequence() {
    const numMessages = Math.floor(Math.random() * 16) + 5;
    const messagePeriod = Math.floor(Math.random() * 2001) + 5000;
    startLightPushSequence(numMessages, messagePeriod);
  }

  document.addEventListener(sequenceCompletedEvent.type, () => startSequence());
  startSequence();
})();
