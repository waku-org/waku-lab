import { LightNode, DecodedMessage, createDecoder } from '@waku/sdk';
import { TelemetryClient } from '../telemetry/client';
import { DEFAULT_CONTENT_TOPIC } from '../../constants';
import { ProtoSequencedMessage, SequencedMessage } from './proto';
import { buildExtraData } from '../util';
import { TelemetryType, TelemetryPushFilter } from '../telemetry/types';

export async function startFilterSubscription(
  node: LightNode, 
  telemetryClient: TelemetryClient, 
  onMessageReceived: (message: string, isSelf: boolean) => void
) {
  const decoder = createDecoder(DEFAULT_CONTENT_TOPIC);
  const peerId = node.libp2p.peerId.toString();

  const subscriptionCallback = async (message: DecodedMessage) => {
    const decodedMessage = ProtoSequencedMessage.decode(message.payload) as unknown as SequencedMessage;
    const messageText = `${decodedMessage.hash} - ${decodedMessage.index + 1} of ${decodedMessage.total}`;
    const isSelf = decodedMessage.sender === peerId;

    onMessageReceived(messageText, isSelf);

    const extraData = await buildExtraData(node, peerId);
    const timestamp = Math.floor(new Date().getTime() / 1000);
    telemetryClient.push<TelemetryPushFilter>([
      {
        type: TelemetryType.LIGHT_PUSH_FILTER,
        protocol: "filter",
        timestamp,
        createdAt: Math.floor(message?.timestamp?.getTime() ?? 0 / 1000),
        seenTimestamp: timestamp,
        peerId: decodedMessage.sender,
        contentTopic: message.contentTopic,
        pubsubTopic: message.pubsubTopic,
        ephemeral: message.ephemeral,
        messageHash: decodedMessage.hash,
        errorMessage: "",
        extraData,
      },
    ]);
  };

  await node.filter.subscribe([decoder], subscriptionCallback);
}