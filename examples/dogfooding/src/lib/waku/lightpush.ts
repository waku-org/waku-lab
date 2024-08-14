import { createEncoder, utils, type LightNode } from "@waku/sdk";
import { generateRandomNumber, hashNumber } from "../../util";
import { ProtoSequencedMessage } from "./proto";
import { DEFAULT_CONTENT_TOPIC } from "../../constants";
import { TelemetryClient } from "../telemetry/client";
import { EVENTS } from "./events";
import { TelemetryPushError, TelemetryPushFilter, TelemetryType } from "../telemetry/types";

export async function startLightPushSequence  (
    waku: LightNode,
    telemetry: TelemetryClient,
    numMessages: number = 10,
    period: number = 10_000
  )  {
    console.info("Starting a new lightpush sequence");
    const sequenceHash = await hashNumber(generateRandomNumber());
    const sequenceTotal = numMessages;
    let sequenceIndex = 0;

    const sendMessage = async () => {
      try {
        const message = ProtoSequencedMessage.create({
          hash: sequenceHash,
          total: sequenceTotal,
          index: sequenceIndex,
          sender: waku.libp2p.peerId.toString(),
        });
        const payload = ProtoSequencedMessage.encode(message).finish();
        const result = await waku.lightPush.send(encoder, {
          payload,
          timestamp: new Date(),
        });
        console.log("light push successes: ", result.successes.length);
        console.log("light push failures: ", result.failures.length);
        console.error(result.failures)
        if (result.successes.length > 0) {
          // Push to telemetry client
          telemetry.push<TelemetryPushFilter>([
            {
              messageType: TelemetryType.LIGHT_PUSH_FILTER,
              timestamp: Math.floor(new Date().getTime() / 1000),
              peerIdSender: waku.libp2p.peerId.toString(),
              peerIdReporter: waku.libp2p.peerId.toString(),
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

          document.dispatchEvent(EVENTS.MESSAGE_SENT);

          // Increment sequence
          sequenceIndex++;
        }
        if (result.failures.length > 0) {
          telemetry.push<TelemetryPushError>(
            result.failures.map((failure) => ({
              messageType: TelemetryType.LIGHT_PUSH_ERROR,
              timestamp: Math.floor(new Date().getTime() / 1000),
              peerId: waku.libp2p.peerId.toString(),
              peerIdRemote: failure.peerId?.toString(),
              errorMessage: failure.error.toString(),
              contentTopic: DEFAULT_CONTENT_TOPIC,
              pubsubTopic: utils.contentTopicToPubsubTopic(DEFAULT_CONTENT_TOPIC),

            }))
          );
        }
        if (sequenceIndex < sequenceTotal) {
          setTimeout(sendMessage, period); // Schedule the next send
        } else {
          document.dispatchEvent(EVENTS.SEQUENCE_COMPLETED);
        }
      } catch (error) {
        console.error("Error sending message", error);
      }
    };

    sendMessage(); // Start the recursive sending
  };

  const encoder = createEncoder({
    contentTopic: DEFAULT_CONTENT_TOPIC,
});