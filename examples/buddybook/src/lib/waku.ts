import { createEncoder, createDecoder, type LightNode } from "@waku/sdk";
import protobuf from 'protobufjs';

export type BlockPayload = {
    title: string;
    description: string;
    signedMessage: string;
    timestamp: number;
}

const contentTopic = "/buddychain/1/chain/proto";

export const encoder = createEncoder({
    contentTopic: contentTopic,
    ephemeral: false
});

export const decoder = createDecoder(contentTopic);

export const block = new protobuf.Type("block")
    .add(new protobuf.Field("title", 3, "string"))
    .add(new protobuf.Field("description", 4, "string"))
    .add(new protobuf.Field("timestamp", 1, "uint64"))
    .add(new protobuf.Field("signedMessage", 2, "string"));

export function createMessage({
    title,
    description,
    signedMessage,
    timestamp
}: BlockPayload) {
    const protoMessage = block.create({
        title,
        description,
        signedMessage,
        timestamp
    });
    const payload = block.encode(protoMessage).finish();
    return { payload: payload };
}

export async function getMessagesFromStore(node: LightNode) {
    console.time("getMessagesFromStore")
    const messages: BlockPayload[] = [];
    await  node.store.queryWithOrderedCallback([decoder], async (message) => {
        if (!message.payload) return;
        const blockPayload =  block.decode(message.payload) as unknown as BlockPayload;
        messages.push(blockPayload);
    })
    console.timeEnd("getMessagesFromStore")
    return messages;
}

export async function subscribeToFilter(node: LightNode, callback: (message: BlockPayload) => void) {
    console.log({
        currConnections: node.libp2p.getConnections().length
    })
    const {error, subscription, results} = await node.filter.subscribe([decoder], (message) => {
        console.log('message received from filter', message)
        if (message.payload) {
            const blockPayload = block.decode(message.payload) as unknown as BlockPayload;
            callback(blockPayload);
        }
    }, {forceUseAllPeers: true, autoRetry: true});
    console.log(results)
    if (error) {
        console.log("Error subscribing to filter", error)
    }
    console.log("Subscribed to filter", subscription)

    return subscription;
}