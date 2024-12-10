import { type DecodedMessage } from "@waku/sdk";
import { WAKU_CONFIG, type ServiceWorkerMessage } from './types';

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

function updateStatus(message: string): void {
    const statusElement = document.getElementById('status');
    if (!statusElement) return;
    statusElement.textContent = message;
    console.log('📢', message);
}

function updatePeerId(peerId: string): void {
    const peerIdElement = document.getElementById('peerId');
    if (!peerIdElement) return;
    peerIdElement.textContent = `Peer ID: ${peerId}`;
    console.log('🆔 Peer ID:', peerId);
}

function addMessageToUI(message: DecodedMessage | string): void {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    
    lastMessageTimestamp = Date.now();
    
    const content = typeof message === 'string' 
        ? message 
        : message.payload 
            ? new TextDecoder().decode(message.payload)
            : 'Empty message';
    
    const timestamp = new Date().toLocaleTimeString();
    messageElement.textContent = `[${timestamp}] ${content}`;
    messageContainer.insertBefore(messageElement, messageContainer.firstChild);
    console.log('💬 New message:', content);
}

class Railgun {
    private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

    constructor() {
        updateStatus('Initializing Railgun...');
        this.initializeServiceWorker();
    }

    private async initializeServiceWorker(): Promise<void> {
        if (!('serviceWorker' in navigator)) {
            updateStatus('Service Workers are not supported in this browser');
            return;
        }

        try {
            this.serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.ts', {
                type: 'module'
            });
            console.log('🔧 Service Worker registered');

            navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
            updateStatus('Failed to initialize Waku: Service Worker registration failed');
        }
    }

    private async handleServiceWorkerMessage(event: MessageEvent<ServiceWorkerMessage>): Promise<void> {
        const { type, message, status, peerId, error, timestamp, contentTopic } = event.data;
        
        switch (type) {
            case 'wakuStatus':
                this.handleWakuStatus(status, peerId, error);
                break;
                
            case 'peerStatus':
                this.handlePeerStatus(status, peerId);
                break;
                
            case 'subscriptionStatus':
                this.handleSubscriptionStatus(status, event.data.topics);
                break;
                
            case 'newMessage':
                this.handleNewMessage(message, timestamp, contentTopic);
                break;
                
            case 'messageSent':
                updateStatus('Message sent successfully');
                break;
                
            case 'error':
                console.error('❌ Service worker error:', error);
                updateStatus(`Error: ${error}`);
                break;
        }
    }

    private handleWakuStatus(status?: string, peerId?: string, error?: string): void {
        if (status === 'ready') {
            updateStatus('Connected to Waku network');
            if (peerId) {
                updatePeerId(peerId);
            }
            this.subscribe();
        } else if (status === 'error') {
            updateStatus(`Waku error: ${error}`);
        }
    }

    private handlePeerStatus(status?: string, peerId?: string): void {
        if (!peerId) return;

        if (status === 'connected') {
            console.log('🟢 Peer connected:', peerId);
            updateStatus('Peer connected');
        } else if (status === 'disconnected') {
            console.log('🔴 Peer disconnected:', peerId);
            updateStatus('Peer disconnected');
        }
    }

    private handleSubscriptionStatus(status?: string, topics?: readonly string[]): void {
        if (status === 'subscribed') {
            updateStatus('Subscribed to Waku topics');
            console.log('📥 Subscribed to topics:', topics);
        }
    }

    private handleNewMessage(message?: string, timestamp?: string, contentTopic?: string): void {
        if (!message) return;
        lastMessageTimestamp = timestamp ? new Date(timestamp).getTime() : Date.now();
        addMessageToUI(`[${contentTopic}] ${message}`);
    }

    async subscribe(): Promise<void> {
        if (!navigator.serviceWorker.controller) {
            console.error('❌ Service Worker not ready');
            return;
        }

        navigator.serviceWorker.controller.postMessage({
            type: 'subscribe',
            payload: { topics: WAKU_CONFIG.CONTENT_TOPICS }
        });
    }

    async push(message: string): Promise<void> {
        if (!navigator.serviceWorker.controller) {
            throw new Error('Service Worker not ready');
        }
        
        updateStatus('Sending message...');
        navigator.serviceWorker.controller.postMessage({
            type: 'sendMessage',
            payload: { message }
        });
        
        addMessageToUI(`Sent: ${message}`);
    }
}

const railgun = new Railgun();
setInterval(updateLastMessageTime, 1000);

declare global {
    interface Window {
        sendMessage: () => Promise<void>;
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