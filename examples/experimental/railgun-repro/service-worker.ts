import { createDecoder, createEncoder, createLightNode, type LightNode, Protocols } from '@waku/sdk';

declare const self: ServiceWorkerGlobalScope;

const WAKU_CONFIG = {
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

interface SendMessagePayload {
    message: string;
}

interface SubscribePayload {
    topics: readonly string[];
}

type MessagePayload = {
    type: 'sendMessage';
    payload: SendMessagePayload;
} | {
    type: 'subscribe';
    payload: SubscribePayload;
};

type ClientMessage = {
    type: string;
    [key: string]: any;
};

let wakuNode: LightNode | null = null;

async function notifyClients(message: ClientMessage): Promise<void> {
    const clients = await self.clients.matchAll();
    clients.forEach(client => client.postMessage(message));
}

async function setupPeerListeners(node: LightNode): Promise<void> {
    node.libp2p.addEventListener('peer:identify', async (evt) => {
        const peerId = evt.detail.peerId.toString();
        console.log('🟢 Peer connected:', peerId);
        await notifyClients({
            type: 'peerStatus',
            status: 'connected',
            peerId
        });
    });

    node.libp2p.addEventListener('peer:disconnect', async (evt) => {
        const peerId = evt.detail.toString();
        console.log('🔴 Peer disconnected:', peerId);
        await notifyClients({
            type: 'peerStatus',
            status: 'disconnected',
            peerId
        });
    });
}

async function initializeWaku(): Promise<void> {
    try {
        console.log('🚀 Initializing Waku node...');
        wakuNode = await createLightNode({
            networkConfig: {
                clusterId: WAKU_CONFIG.NETWORK.CLUSTER_ID,
                shards: [WAKU_CONFIG.NETWORK.SHARD],
            }
        });
        
        await setupPeerListeners(wakuNode);
        
        await wakuNode.start();
        console.log('✅ Waku node started');
        
        await wakuNode.dial(WAKU_CONFIG.NETWORK.RAILGUN_MA);
        console.log('🔗 Connected to Railgun peer');

        await wakuNode.waitForPeers([Protocols.Filter]);
        console.log('📡 Filter protocol peer ready');
        
        await notifyClients({
            type: 'wakuStatus',
            status: 'ready',
            peerId: wakuNode.libp2p.peerId.toString()
        });

        await subscribeToTopics();
    } catch (error) {
        console.error('❌ Error initializing Waku:', error);
        await notifyClients({
            type: 'wakuStatus',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function subscribeToTopics(): Promise<void> {
    if (!wakuNode) {
        console.error('❌ Waku node not initialized');
        return;
    }
    
    try {
        console.log('📥 Creating decoders for topics:', WAKU_CONFIG.CONTENT_TOPICS);
        const decoders = WAKU_CONFIG.CONTENT_TOPICS.map(
            topic => createDecoder(topic, WAKU_CONFIG.PUBSUB_TOPIC)
        );
        
        await wakuNode.waitForPeers([Protocols.Filter]);
        
        const { error } = await wakuNode.filter.subscribe(decoders, handleIncomingMessage);

        if (error) {
            throw new Error(`Subscription error: ${error}`);
        }
        
        console.log('✅ Successfully subscribed to topics');
        await notifyClients({
            type: 'subscriptionStatus',
            status: 'subscribed',
            topics: WAKU_CONFIG.CONTENT_TOPICS
        });
    } catch (error) {
        console.error('❌ Error subscribing:', error);
        await notifyClients({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function handleIncomingMessage(message: { payload: Uint8Array; contentTopic: string }): Promise<void> {
    console.log('📨 Message received on topic:', message.contentTopic);
    const content = new TextDecoder().decode(message.payload);
    await notifyClients({
        type: 'newMessage',
        message: content,
        timestamp: new Date().toISOString(),
        contentTopic: message.contentTopic
    });
}

async function sendMessage(message: string): Promise<void> {
    if (!wakuNode) {
        throw new Error('Waku node not initialized');
    }

    try {
        const encoder = createEncoder({
            contentTopic: WAKU_CONFIG.CONTENT_TOPICS[0],
            pubsubTopic: WAKU_CONFIG.PUBSUB_TOPIC,
        });
        
        await wakuNode.lightPush.send(encoder, {
            payload: new TextEncoder().encode(message)
        });
        console.log('📤 Message sent:', message);
        
        await notifyClients({
            type: 'messageSent',
            message
        });
    } catch (error) {
        console.error('❌ Error sending message:', error);
        await notifyClients({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

self.addEventListener('install', () => {
    console.log('🔧 Service Worker: Installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
    console.log('🔧 Service Worker: Activating...');
    event.waitUntil(initializeWaku());
});

self.addEventListener('message', async (event: ExtendableMessageEvent) => {
    const { type, payload } = event.data as MessagePayload;
    
    switch (type) {
        case 'sendMessage':
            await sendMessage(payload.message);
            break;

        case 'subscribe':
            await subscribeToTopics();
            break;

        default:
            console.warn('⚠️ Unknown message type:', type);
    }
}); 