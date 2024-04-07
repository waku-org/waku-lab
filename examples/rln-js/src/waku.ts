import {type LightNode, createLightNode, waitForRemotePeer, type IFilterSubscription, IDecodedMessage } from "@waku/sdk";

import {
  ProtoChatMessage,
  CONTENT_TOPIC,
  KEYSTORE,
  MEMBERSHIP_HASH,
  MEMBERSHIP_PASSWORD,
} from "./const";
import { RLNDecoder, RLNEncoder, RLNInstance } from "@waku/rln";
import { StatusChangeArgs } from "./types";

type Args = {
  rln: RLNInstance,
  onStatusChange: (args: StatusChangeArgs) => void,
};

type IChatMessage = {
  nick: string,
  text: string,
  timestamp: number,
};

export async function initWaku({ rln, onStatusChange }: Args) {
  let node: LightNode;
  let encoder: RLNEncoder, decoder: RLNDecoder<IDecodedMessage>;
  let subscription: IFilterSubscription;

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
  
    onStatusChange({
      newStatus: "Initializing Waku..."
    });
    node = await createLightNode({
      defaultBootstrap: true,
    });
    onStatusChange({
      newStatus: "Waiting for peers"
    });
    await node.start();
    await waitForRemotePeer(node);
  };

  const onSend = async (nick: string, text: string) => {
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

  const onSubscribe = async (cb: (nick: string, text: string, timestamp: number, proofStatus: string) => void ) => {
    onStatusChange({
      newStatus: "Subscribing to content topic..."
    });
    subscription = await node.filter.createSubscription();

    await subscription.subscribe(decoder, (message) => {
      try {
        
        const { timestamp, nick, text } = ProtoChatMessage.decode(
          message.payload
        ) as unknown as IChatMessage;

        let proofStatus = "no proof";
        if (message.rateLimitProof) {
          console.log("Proof received: ", message.rateLimitProof);

          try {
            if (!rln.contract) {
              throw new Error("RLN contract not initialized");
            }

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

    onStatusChange({
      newStatus: "Waku initialized",
      className: "success"
    });
  };

  return {
    onSend,
    onSubscribe,
    onInitWaku,
  };
}
