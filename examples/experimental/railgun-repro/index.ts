import { createDecoder, createEncoder, createLightNode, Protocols, type LightNode, type Decoder, type DecodedMessage } from "@waku/sdk";
import { determinePubsubTopic } from "@waku/utils";

const CONTENT_TOPICS = [
  "/railgun/v2/0-1-fees/json",
  "/railgun/v2/0-56-fees/json", 
  "/railgun/v2/0-137-fees/json",
  "/railgun/v2/0-42161-fees/json",
  "/railgun/v2/0-421$1-transact-response/json",
  "/railgun/v2/encrypted-metrics-pong/json"
] as const;

const PUBSUB_TOPIC = "/waku/2/rs/0/1";
const railgunMa = "/dns4/railgun.ivansete.xyz/tcp/8000/wss/p2p/16Uiu2HAmExcXDvdCr2XxfCeQY1jhCoJ1HodgKauRatCngQ9Q1X61";
const clusterId = 0;
const shard = 1;

console.log({
  pubsub: determinePubsubTopic(CONTENT_TOPICS[0], PUBSUB_TOPIC),
});

// Add timestamp tracking
let lastMessageTimestamp: number | null = null;

function updateLastMessageTime(): void {
    const timestampElement = document.getElementById('lastMessageTime');
    if (!timestampElement) return;

    if (!lastMessageTimestamp) {
        timestampElement.textContent = 'No messages received yet';
        return;
    }

    const now = Date.now();
    const timeDiff = now - lastMessageTimestamp;
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        timestampElement.textContent = `Last message: ${hours}h ${minutes % 60}m ago`;
    } else if (minutes > 0) {
        timestampElement.textContent = `Last message: ${minutes}m ${seconds % 60}s ago`;
    } else {
        timestampElement.textContent = `Last message: ${seconds}s ago`;
    }
}

// Update the timestamp display every second
setInterval(updateLastMessageTime, 1000);

function updateStatus(message: string): void {
    const statusElement = document.getElementById('status');
    if (!statusElement) return;
    statusElement.textContent = message;
}

function addMessageToUI(message: DecodedMessage | string): void {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    // Update last message timestamp
    lastMessageTimestamp = Date.now();
    
    let content: string;
    if (typeof message === 'string') {
        content = message;
    } else if (message.payload) {
        content = new TextDecoder().decode(message.payload);
    } else {
        content = 'Empty message';
    }
    
    const timestamp = new Date().toLocaleTimeString();
    messageElement.textContent = `[${timestamp}] ${content}`;
    messageContainer.insertBefore(messageElement, messageContainer.firstChild);
}

class Railgun {
  private waku: LightNode | null = null;
  private subscriptionStartTime: number | null = null;
  private messageCount = 0;

  constructor() {
    updateStatus('Initializing Railgun...');
  }

  get decoders(): Decoder[] {
    console.log('Creating decoders for content topics:', CONTENT_TOPICS);
    return CONTENT_TOPICS.map(topic => createDecoder(topic, PUBSUB_TOPIC));
  }

  async start(): Promise<void> {
    updateStatus('Starting Waku light node...');
    this.waku = await createLightNode({
      networkConfig: {
        shards: [shard],
        clusterId: clusterId,
      }
    });    

    const peerIdElement = document.getElementById('peerId');
    if (peerIdElement) {
      peerIdElement.textContent = `Peer ID: ${this.waku.libp2p.peerId.toString()}`;
    }
    
    updateStatus('Connecting to peer...');
    await this.waku.dial(railgunMa);
    await this.waku.waitForPeers([Protocols.Filter]);
    updateStatus('Connected successfully');

    this.waku.libp2p.addEventListener("peer:identify", async(peer) => {
      updateStatus('Peer connected');
      addMessageToUI(`Peer connected: ${peer.detail.peerId}`);
    });
    
    this.waku.libp2p.addEventListener("peer:disconnect", (peer) => {
      updateStatus('Peer disconnected');
      addMessageToUI(`Peer disconnected: ${peer.detail}`);
    });
  }

  async subscribe(): Promise<void> {
    if (!this.waku) throw new Error('Waku not initialized');
    
    this.subscriptionStartTime = Date.now();
    this.messageCount = 0;
    updateStatus('Subscribing to Waku filters...');

    const {error} = await this.waku.filter.subscribe(this.decoders, (message) => {
      this.messageCount++;
      if (message.payload) {
        const decodedMessage = new TextDecoder().decode(message.payload);
        lastMessageTimestamp = Date.now();
        addMessageToUI(decodedMessage);
        
        // Log debug information
        console.log('Filter message received:', {
          messageCount: this.messageCount,
          timeSinceSubscription: `${(Date.now() - (this.subscriptionStartTime || 0)) / 1000}s`,
          contentTopic: message.contentTopic,
          payload: decodedMessage,
          timestamp: new Date().toISOString(),
          lastMessageTimestamp
        });
      }
    }, {forceUseAllPeers: false});
    
    if (error) {
      updateStatus(`Subscription error: ${error}`);
    } else {
      updateStatus('Successfully subscribed to Waku filters');
    }

    // Add periodic connection check
    setInterval(() => this.checkConnection(), 30000); // Check every 30 seconds
  }

  private async checkConnection(): Promise<void> {
    if (!this.waku) return;

    const connections = this.waku.libp2p.getConnections();
    const filterPeers = this.waku.filter.connectedPeers;
    
    console.log('Connection status:', {
      totalConnections: connections.length,
      filterPeers: filterPeers.length,
      messageCount: this.messageCount,
      timeSinceLastMessage: lastMessageTimestamp ? 
        `${(Date.now() - lastMessageTimestamp) / 1000}s ago` : 
        'No messages received',
      uptime: this.subscriptionStartTime ? 
        `${(Date.now() - this.subscriptionStartTime) / 1000}s` : 
        'Not subscribed'
    });

    if (connections.length === 0 || filterPeers.length === 0) {
      updateStatus('Connection lost - attempting to reconnect...');
      try {
        await this.waku.dial(railgunMa);
        await this.waku.waitForPeers([Protocols.Filter]);
        updateStatus('Reconnected successfully');
      } catch (error) {
        updateStatus(`Reconnection failed: ${error}`);
      }
    }
  }

  async push(message: string): Promise<void> {
    if (!this.waku) throw new Error('Waku not initialized');
    
    updateStatus('Pushing message...');
    const encoder = createEncoder({
      contentTopic: CONTENT_TOPICS[0],
      pubsubTopic: PUBSUB_TOPIC
    });
    
    const {failures} = await this.waku.lightPush.send(encoder, {
      payload: new TextEncoder().encode(message)
    });
    
    if (failures.length > 0) {
      updateStatus(`Error sending message: ${failures}`);
    } else {
      updateStatus('Message sent successfully');
      addMessageToUI(`Sent: ${message}`);
    }
  }

  getWaku(): LightNode | null {
    return this.waku;
  }
}

const railgun = new Railgun();
export default railgun;

// Initialize the application
await railgun.start();
await railgun.subscribe();

// Add global functions and objects
declare global {
    interface Window {
        sendMessage: () => Promise<void>;
        waku: LightNode | null;
    }
}

window.sendMessage = async (): Promise<void> => {
    const input = document.getElementById('messageInput') as HTMLInputElement;
    const message = input.value.trim();
    if (message) {
        await railgun.push(message);
        input.value = '';
    }
};

window.waku = railgun.getWaku();