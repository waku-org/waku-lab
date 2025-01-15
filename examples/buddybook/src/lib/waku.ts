import { createEncoder, createDecoder, type LightNode } from "@waku/sdk";
import { type CreateWakuNodeOptions } from "@waku/sdk";
import protobuf from 'protobufjs';
import { v4 as uuidv4 } from 'uuid';
import { Telemetry, fromFilter, fromStore, TelemetryType, buildExtraData, toInt } from "./telemetry";

export const WAKU_NODE_OPTIONS: CreateWakuNodeOptions = {
    defaultBootstrap: true,
    nodeToUse: {
        store: "/dns4/node-01.ac-cn-hongkong-c.waku.test.status.im/tcp/8000/wss/p2p/16Uiu2HAkzHaTP5JsUwfR9NR8Rj9HC24puS6ocaU8wze4QrXr9iXp"
    }
};

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

const contentTopic = "/buddybook-devcon/1/chain/proto";

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

export async function* getMessagesFromStore(node: LightNode) {
    const startTime = Math.floor(Date.now() / 1000);
    try {
        for await (const messagePromises of node.store.queryGenerator([decoder])) {
            const messages = await Promise.all(messagePromises);
            for (const message of messages) {
                console.log(message)
                if (!message?.payload) continue;
                const blockPayload = block.decode(message.payload) as unknown as BlockPayload;
                blockPayload.signatures = blockPayload.signatures.map(s => JSON.parse(s as unknown as string) as Signature);
                yield blockPayload;
            }
        }
        const endTime = Math.floor(Date.now() / 1000);
        const timeTaken = endTime - startTime;
        console.log("getMessagesFromStore", timeTaken)

        Telemetry.push(fromStore({
            node,
            decoder,
            timestamp: startTime,
            timeTaken,
        }));
    } catch(e) {
        const endTime = Math.floor(Date.now() / 1000);
        const timeTaken = endTime - startTime;
        Telemetry.push([{
            type: TelemetryType.LIGHT_PUSH_FILTER,
            protocol: "lightPush",
            timestamp: startTime,
            createdAt: startTime,
            seenTimestamp: startTime,
            peerId: node.peerId.toString(),
            contentTopic: encoder.contentTopic,
            pubsubTopic: encoder.pubsubTopic,
            ephemeral: encoder.ephemeral,
            messageHash: uuidv4(),
            errorMessage: (e as Error)?.message ?? "Error during Store",
            extraData: buildExtraData({ timeTaken }),
          }]);
        throw e;
    }
}

export async function subscribeToFilter(node: LightNode, callback: (message: BlockPayload) => void) {
    const result = await node.filter.subscribe([decoder], (message) => {
        console.log('message received from filter', message)
        if (message.payload) {
            const blockPayload = block.decode(message.payload) as unknown as BlockPayload;
            blockPayload.signatures = blockPayload.signatures.map(s => JSON.parse(s as unknown as string) as Signature);
            callback(blockPayload);
        }
    }, {forceUseAllPeers: false});

    Telemetry.push(fromFilter({
        result,
        node,
        decoder,
        timestamp: Math.floor(Date.now() / 1000),
    }));

    const {error, subscription, results} = result;
    console.log("results", results)
    
    if (error) {
        console.log("Error subscribing to filter", error)
    }

    if (!subscription || error || results.successes.length === 0 || results.failures.length > 0) {
        throw new Error("Failed to subscribe to filter")
    }
}

export function calculateTotalSignatures(block: BlockPayload, allBlocks: BlockPayload[]): number {
    const childBlocks = allBlocks.filter(b => b.parentBlockUUID === block.blockUUID);
    return block.signatures.length + childBlocks.reduce((acc, child) => 
        acc + calculateTotalSignatures(child, allBlocks), 0
    );
}

export function sortBlocksBySignatures(blocks: BlockPayload[], allBlocks: BlockPayload[]): BlockPayload[] {
    return [...blocks].sort((a, b) => {
        const totalSignaturesA = calculateTotalSignatures(a, allBlocks);
        const totalSignaturesB = calculateTotalSignatures(b, allBlocks);
        return totalSignaturesB - totalSignaturesA;
    });
}
