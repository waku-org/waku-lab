import { LightNode, createEncoder } from '@waku/sdk';
import { TelemetryClient } from '../telemetry/client.js';
import { DEFAULT_CONTENT_TOPIC, DEFAULT_PUBSUB_TOPIC } from '../../constants';
import { ProtoSequencedMessage } from './proto';
import { generateRandomNumber, sha256, buildExtraData } from '../util';
import { TelemetryType, TelemetryPushFilter } from '../telemetry/types';

export async function startLightPushSequence(
  waku: LightNode,
  telemetryClient: TelemetryClient,
  onMessageSent: (message: string, success: boolean) => void,
  updateSequenceId: (newId: number) => void,
  updateCountdown: (countdown: number | null) => void,
  isRunning: { current: boolean },
  numMessages: number = 10,
  period: number = 10_000
) {
  if (isRunning.current) {
    console.log("A sequence is already running. Skipping this call.");
    return;
  }

  isRunning.current = true;
  console.info("Starting a new lightpush sequence");
  const sequenceHash = await sha256(generateRandomNumber().toString());
  const sequenceTotal = numMessages;
  let sequenceIndex = 0;

  const encoder = createEncoder({
    contentTopic: DEFAULT_CONTENT_TOPIC,
  });

  const sendMessage = async () => {
    try {
      const reportingHash = await sha256(`${sequenceHash}-${sequenceIndex}-${sequenceTotal}`);

      const timestamp = Math.floor(new Date().getTime() / 1000);
      const message = ProtoSequencedMessage.create({
        hash: reportingHash,
        total: sequenceTotal,
        index: sequenceIndex,
        sender: waku.libp2p.peerId.toString(),
      });
      const payload = ProtoSequencedMessage.encode(message).finish();
      const result = await waku.lightPush.send(encoder, {
        payload,
        timestamp: new Date(),
      });

      const events = await Promise.all([
        ...result.successes.map(async (peerId) => {
          const extraData = await buildExtraData(waku, peerId.toString());
          return {
            type: TelemetryType.LIGHT_PUSH_FILTER,
            protocol: "lightPush",
            timestamp,
            createdAt: timestamp,
            seenTimestamp: timestamp,
            peerId: peerId.toString(),
            contentTopic: DEFAULT_CONTENT_TOPIC,
            pubsubTopic: DEFAULT_PUBSUB_TOPIC,
            ephemeral: false,
            messageHash: reportingHash,
            errorMessage: "",
            extraData,
          };
        }),
        ...result.failures.map(async (fail) => {
          const extraData = await buildExtraData(waku, fail?.peerId?.toString() ?? "");
          return {
            type: TelemetryType.LIGHT_PUSH_FILTER,
            protocol: "lightPush",
            timestamp,
            createdAt: timestamp,
            seenTimestamp: timestamp,
            peerId: fail?.peerId?.toString() ?? "",
            contentTopic: DEFAULT_CONTENT_TOPIC,
            pubsubTopic: DEFAULT_PUBSUB_TOPIC,
            ephemeral: false,
            messageHash: reportingHash,
            errorMessage: fail?.error?.toString() ?? "",
            extraData,
          };
        }),
      ]);

      if (events.length > 0) {
        telemetryClient.push<TelemetryPushFilter>(events);
      }

      const success = result.successes.length > 0;
      if (success) {
        const messageText = JSON.stringify({ content: `${reportingHash} - ${sequenceIndex + 1} of ${sequenceTotal}`, success: true });
        onMessageSent(messageText, true);
      } else {
        const messageText = JSON.stringify({ content: `Failed to send message ${sequenceIndex + 1} of ${sequenceTotal}`, success: false });
        onMessageSent(messageText, false);
      }

      sequenceIndex++;

      if (sequenceIndex < sequenceTotal) {
        let countdown = period / 1000;
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          updateCountdown(countdown);
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            updateCountdown(null);
          }
        }, 1000);
        setTimeout(() => {
          clearInterval(countdownInterval);
          sendMessage();
        }, period);
      } else {
        console.info("Lightpush sequence completed");
        updateSequenceId(sequenceIndex);
        updateCountdown(null);
        isRunning.current = false;
        // Start a new sequence after a delay
        setTimeout(() => startLightPushSequence(waku, telemetryClient, onMessageSent, updateSequenceId, updateCountdown, isRunning, numMessages, period), period);
      }
    } catch (error) {
      console.error("Error sending message", error);
      const messageText = JSON.stringify({ content: `Error sending message ${sequenceIndex + 1} of ${sequenceTotal}`, success: false });
      onMessageSent(messageText, false);
      sequenceIndex++;
      
      if (sequenceIndex < sequenceTotal) {
        setTimeout(() => sendMessage(), period);
      } else {
        console.info("Lightpush sequence completed with errors");
        updateSequenceId(sequenceIndex);
        updateCountdown(null);
        isRunning.current = false;
        // Start a new sequence after a delay
        setTimeout(() => startLightPushSequence(waku, telemetryClient, onMessageSent, updateSequenceId, updateCountdown, isRunning, numMessages, period), period);
      }
    }
  };

  sendMessage();
}