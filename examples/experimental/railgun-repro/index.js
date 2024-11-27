import { createDecoder, createEncoder, createLightNode, Protocols } from "@waku/sdk";
import { determinePubsubTopic } from "@waku/utils";


const CONTENT_TOPICS = [
  "/railgun/v2/0-1-fees/json",
  "/railgun/v2/0-56-fees/json", 
  "/railgun/v2/0-137-fees/json",
  "/railgun/v2/0-42161-fees/json",
  "/railgun/v2/0-421$1-transact-response/json",
  "/railgun/v2/encrypted-metrics-pong/json"
];
const PUBSUB_TOPIC = "/waku/2/rs/0/1"

const railgunMa = "/dns4/railgun.ivansete.xyz/tcp/8000/wss/p2p/16Uiu2HAmExcXDvdCr2XxfCeQY1jhCoJ1HodgKauRatCngQ9Q1X61"

const clusterId = 0;
const shard = 1;

console.log({
  pubsub: determinePubsubTopic(CONTENT_TOPICS[0], PUBSUB_TOPIC),
})

// Add DOM helper functions
function updateStatus(status) {
    document.getElementById('status').textContent = `Status: ${status}`;
}

function addMessageToUI(message) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    let content = message;
    if (message.payload) {
        content = new TextDecoder().decode(message.payload);
    }
    
    messageElement.textContent = content;
    messageContainer.insertBefore(messageElement, messageContainer.firstChild);
}

class Railgun {
  constructor() {
    updateStatus('Initializing Railgun...');
  }

  get decoders() {
    console.log('Creating decoders for content topics:', CONTENT_TOPICS);
    return CONTENT_TOPICS.map(topic => createDecoder(topic, PUBSUB_TOPIC));
  }

  async start() {
    updateStatus('Starting Waku light node...');
    this.waku = await createLightNode({
      networkConfig: {
        shards: [shard],
        clusterId: clusterId,
      }
    });
    
    updateStatus('Connecting to peer...');
    await this.waku.dial(railgunMa);
    await this.waku.waitForPeers([Protocols.Filter]);
    updateStatus('Connected successfully');

    this.waku.libp2p.addEventListener("peer:identify", async(peer) => {
      updateStatus('Peer connected');
      addMessageToUI(`Peer connected: ${peer.detail.id}`);
    });
    
    this.waku.libp2p.addEventListener("peer:disconnect", (peer) => {
      updateStatus('Peer disconnected');
      addMessageToUI(`Peer disconnected: ${peer.detail.id}`);
    });
  }

  async subscribe() {
    updateStatus('Subscribing to Waku filters...');

    const {error} = await this.waku.filter.subscribe(this.decoders, (message) => {
      if (message.payload) {
        addMessageToUI(message);
      }
    }, {forceUseAllPeers: false});
    
    if (error) {
      updateStatus(`Subscription error: ${error.message}`);
    } else {
      updateStatus('Successfully subscribed to Waku filters');
    }
  }

  async push(message) {
    updateStatus('Pushing message...');
    const encoder = createEncoder({
      contentTopic: CONTENT_TOPICS[0],
      pubsubTopic: PUBSUB_TOPIC
    });
    
    const result = await this.waku.lightPush.send(encoder, {
      payload: new TextEncoder().encode(message)
    });
    
    if (result.error) {
      updateStatus(`Error sending message: ${result.error.message}`);
    } else {
      updateStatus('Message sent successfully');
      addMessageToUI(`Sent: ${message}`);
    }
  }
}

const railgun = new Railgun();
export default railgun;

// Initialize the application
await railgun.start();
await railgun.subscribe();

// Add global function for sending messages
window.sendMessage = async () => {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  if (message) {
    await railgun.push(message);
    input.value = '';
  }
};
