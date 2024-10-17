import { createEncoder, createDecoder } from "@waku/sdk";
import protobuf from 'protobufjs';

export type BlockPayload = {
    title: string;
    description: string;
    signedMessage: string;
    timestamp: number;
}

const contentTopic = "/waku-react-guide/1/chat/proto";

export const encoder = createEncoder({
    contentTopic: contentTopic,
    ephemeral: false
});

export const decoder = createDecoder(contentTopic);

const block = new protobuf.Type("block")
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
