import { createLightNode, waitForRemotePeer } from "@waku/sdk";

import {
  ProtoChatMessage,
  CONTENT_TOPIC,
  KEYSTORE,
  MEMBERSHIP_HASH,
  MEMBERSHIP_PASSWORD,
} from "./const";

export async function initWaku({ rln, onStatusChange }) {
  let node;
  let encoder, decoder;
  let subscription;

  const onInitWaku = async () => {
    encoder = await rln.createEncoder({
      ephemeral: false,
      contentTopic: CONTENT_TOPIC,
      credentials: {
        keystore: KEYSTORE,
        id: MEMBERSHIP_HASH,
        password: MEMBERSHIP_PASSWORD,
      },
    });
    decoder = rln.createDecoder(CONTENT_TOPIC);
  
    onStatusChange("Initializing Waku...");
    node = await createLightNode({
      pubsubTopics: ["/waku/2/default-waku/proto"],
      defaultBootstrap: true,
    });
    onStatusChange("Waiting for peers");
    await node.start();
    await waitForRemotePeer(node);
  };

  const onSend = async (nick, text) => {
    const timestamp = new Date();
    const msg = ProtoChatMessage.create({
      text,
      nick,
      timestamp: Math.floor(timestamp.valueOf() / 1000),
    });
    const payload = ProtoChatMessage.encode(msg).finish();
    console.log("Sending message with proof...");

    const res = await node.lightPush.send(encoder, { payload, timestamp });
    console.log("Message sent:", res);
  };

  const onSubscribe = async (cb) => {
    onStatusChange("Subscribing to content topic...");
    subscription = await node.filter.createSubscription();

    await subscription.subscribe(decoder, (message) => {
      try {
        const { timestamp, nick, text } = ProtoChatMessage.decode(
          message.payload
        );

        let proofStatus = "no proof";
        if (message.rateLimitProof) {
          console.log("Proof received: ", message.rateLimitProof);

          try {
            console.time("Proof verification took:");
            const res = message.verify(rln.contract.roots());
            console.timeEnd("Proof verification took:");
            proofStatus = res ? "verified" : "not verified";
          } catch (error) {
            proofStatus = "invalid";
            console.error("Failed to verify proof: ", error);
          }
        }

        console.log({
          nick,
          text,
          proofStatus,
          time: new Date(timestamp).toDateString(),
        });
        cb(nick, text, timestamp, proofStatus);
      } catch (error) {
        console.error("Failed in subscription listener: ", error);
      }
    });

    onStatusChange("Waku initialized", "success");
  };

  return {
    onSend,
    onSubscribe,
    onInitWaku,
  };
}
