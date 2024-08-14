import { createDecoder, type LightNode, type DecodedMessage, utils } from "@waku/sdk";
import { TelemetryClient } from "../telemetry/client";
import { ProtoSequencedMessage } from "./proto";
import { DEFAULT_CONTENT_TOPIC } from "../../constants";
import { TelemetryPushFilter, TelemetryType } from "../telemetry/types";

export async function startFilterSubscription (waku: LightNode, telemetry: TelemetryClient) {
    const decoder = createDecoder(DEFAULT_CONTENT_TOPIC);

    const messagesReceived = document.getElementById("messagesReceived");
    const subscriptionCallback = (message: DecodedMessage) => {
      const sequencedMessage: any = ProtoSequencedMessage.decode(
        message.payload
      );

      // Don't bother reporting messages sent by this same node
      if (sequencedMessage.sender === waku.libp2p.peerId.toString()) {
        return;
      }
      telemetry.push<TelemetryPushFilter>([
        {
          messageType: TelemetryType.LIGHT_PUSH_FILTER,
          timestamp: Math.floor(new Date().getTime() / 1000),
          peerIdSender: sequencedMessage.sender,
          peerIdReporter: waku.libp2p.peerId.toString(),
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

    await waku.filter.subscribe(decoder, subscriptionCallback);
  };