export const WAKU_CONFIG = {
    PUBSUB_TOPIC: "/waku/2/rs/0/1",
    CONTENT_TOPICS: [
        "/railgun/v2/0-1-fees/json",
        "/railgun/v2/0-56-fees/json", 
        "/railgun/v2/0-137-fees/json",
        "/railgun/v2/0-42161-fees/json",
        "/railgun/v2/0-421$1-transact-response/json",
        "/railgun/v2/encrypted-metrics-pong/json"
    ] as const,
    NETWORK: {
        CLUSTER_ID: 0,
        SHARD: 1,
        RAILGUN_MA: '/dns4/railgun.ivansete.xyz/tcp/8000/wss/p2p/16Uiu2HAmExcXDvdCr2XxfCeQY1jhCoJ1HodgKauRatCngQ9Q1X61'
    }
} as const;

export interface SendMessagePayload {
    message: string;
}

export interface SubscribePayload {
    topics: readonly string[];
}

export type MessagePayload = {
    type: 'sendMessage';
    payload: SendMessagePayload;
} | {
    type: 'subscribe';
    payload: SubscribePayload;
};

export type ClientMessage = {
    type: string;
    [key: string]: any;
};

export interface ServiceWorkerMessage {
    type: string;
    message?: string;
    status?: string;
    peerId?: string;
    error?: string;
    timestamp?: string;
    contentTopic?: string;
    topics?: readonly string[];
}

export interface WakuMessage {
    payload: Uint8Array;
    contentTopic: string;
} 