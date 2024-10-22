import { createEncoder, createDecoder, type LightNode } from "@waku/sdk";
import protobuf from 'protobufjs';

export const WAKU_NODE_OPTIONS = { defaultBootstrap: true };


export type Signature = {
  address: `0x${string}`;
  signature: string;
};

export type BlockPayload = {
    chainUUID: string;
    blockUUID: string;
    title: string;
    description: string;
    signedMessage: string;
    timestamp: number;
    signatures: Signature[];
    parentBlockUUID: string | null;
}

const contentTopic = "/buddychain/1/chain/proto";

export const encoder = createEncoder({
    contentTopic: contentTopic,
    ephemeral: false
});

export const decoder = createDecoder(contentTopic);

export const block = new protobuf.Type("block")
    .add(new protobuf.Field("chainUUID", 1, "string"))
    .add(new protobuf.Field("blockUUID", 2, "string"))
    .add(new protobuf.Field("title", 3, "string"))
    .add(new protobuf.Field("description", 4, "string"))
    .add(new protobuf.Field("signedMessage", 5, "string"))
    .add(new protobuf.Field("timestamp", 6, "uint64"))
    .add(new protobuf.Field("signatures", 7, "string", "repeated"))
    .add(new protobuf.Field("parentBlockUUID", 8, "string"));

export function createMessage({
    chainUUID,
    blockUUID,
    title,
    description,
    signedMessage,
    timestamp,
    signatures,
    parentBlockUUID
}: BlockPayload) {
    const protoMessage = block.create({
        chainUUID,
        blockUUID,
        title,
        description,
        signedMessage,
        timestamp,
        signatures: signatures.map(s => JSON.stringify(s)),
        parentBlockUUID
    });
    const payload = block.encode(protoMessage).finish();
    return { payload: payload };
}

export async function getMessagesFromStore(node: LightNode) {
    console.time("getMessagesFromStore")
    const messages: BlockPayload[] = [];
    await node.store.queryWithOrderedCallback([decoder], async (message) => {
        if (!message.payload) return;
        const blockPayload = block.decode(message.payload) as unknown as BlockPayload;
        blockPayload.signatures = blockPayload.signatures.map(s => JSON.parse(s as unknown as string) as Signature);
        messages.push(blockPayload);
    })
    console.timeEnd("getMessagesFromStore")
    return messages;
}

export async function subscribeToFilter(node: LightNode, callback: (message: BlockPayload) => void) {
    const {error, subscription, results} = await node.filter.subscribe([decoder], (message) => {
        console.log('message received from filter', message)
        if (message.payload) {
            const blockPayload = block.decode(message.payload) as unknown as BlockPayload;
            blockPayload.signatures = blockPayload.signatures.map(s => JSON.parse(s as unknown as string) as Signature);
            callback(blockPayload);
        }
    }, {forceUseAllPeers: true});

    console.log("results", results)
    
    if (error) {
        console.log("Error subscribing to filter", error)
    }

    if (!subscription || error || results.successes.length === 0 ||results.failures.length >0) {
        throw new Error("Failed to subscribe to filter")
    }
}
