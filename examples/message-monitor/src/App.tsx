import React, { useState, useEffect, useRef } from 'react';
import { setupWaku } from './lib/waku';
import { startLightPushSequence } from './lib/waku/lightpush';
import { startFilterSubscription } from './lib/waku/filter';
import { TelemetryClient } from './lib/telemetry/client';
import { TELEMETRY_URL } from './constants';
import MessageList from './components/MessageList';
import Stats from './components/Stats';
import CountdownTimer from './components/CountdownTimer';
import { Message } from './lib/telemetry/types';
import SuccessIndicator from './components/SuccessIndicator';

let currentSequenceId = 1;

function App() {
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [selfReceivedMessages, setSelfReceivedMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({ sent: 0, received: 0, selfReceived: 0 });
  const [nextMessageCountdown, setNextMessageCountdown] = useState<number | null>(null);
  const [lastSentSuccess, setLastSentSuccess] = useState<boolean | null>(null);
  const [nodeInfo, setNodeInfo] = useState({
    totalConnections: 0,
    filterPeers: 0,
    lightPushPeers: 0,
    storePeers: 0,
  });
  const isRunning = useRef(false);

  useEffect(() => {
    const initWaku = async () => {
      const waku = await setupWaku();
      const telemetryClient = new TelemetryClient(TELEMETRY_URL);
      telemetryClient.start();

      const updateNodeInfo = () => {
        setNodeInfo({
          totalConnections: waku.libp2p.getConnections().length,
          filterPeers: waku.filter.connectedPeers.length,
          lightPushPeers: waku.lightPush.connectedPeers.length,
          storePeers: waku.store.connectedPeers.length,
        });
      };

      updateNodeInfo();
      const nodeInfoInterval = setInterval(updateNodeInfo, 5000);

      startFilterSubscription(waku, telemetryClient, (content, isSelf) => {
        const message: Message = {
          content,
          sequenceId: currentSequenceId,
          timestamp: Date.now()
        };

        if (isSelf) {
          setSelfReceivedMessages(prev => [...prev, message]);
          setStats(prev => ({ ...prev, selfReceived: prev.selfReceived + 1 }));
        } else {
          setReceivedMessages(prev => [...prev, message]);
          setStats(prev => ({ ...prev, received: prev.received + 1 }));
        }
      });

      const updateSequenceId = (newId: number) => {
        currentSequenceId = newId === 1 ? 1 : currentSequenceId + 1;
        console.log("Updated sequence ID to:", currentSequenceId);
      };

      startLightPushSequence(
        waku,
        telemetryClient,
        (messageText, success) => {
          const message: Message = {
            content: messageText,
            sequenceId: currentSequenceId,
            timestamp: Date.now()
          };
          setSentMessages(prev => [message, ...prev]);
          setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
          setLastSentSuccess(success);
        },
        updateSequenceId,
        setNextMessageCountdown,
        isRunning
      );

      return () => {
        clearInterval(nodeInfoInterval);
        telemetryClient.stop();
      };
    };

    initWaku();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Waku Message Monitor</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <MessageList title="Sent Messages" messages={sentMessages} showSequence={true} />
            <MessageList title="Received Messages" messages={receivedMessages} showSequence={false} />
          </div>
          <div className="space-y-8">
            <MessageList title="Self-Received Messages" messages={selfReceivedMessages} showSequence={true} />
            <Stats stats={stats} />
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Node Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Connections</p>
                  <p className="text-lg font-semibold text-gray-800">{nodeInfo.totalConnections}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Filter Peers</p>
                  <p className="text-lg font-semibold text-gray-800">{nodeInfo.filterPeers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">LightPush Peers</p>
                  <p className="text-lg font-semibold text-gray-800">{nodeInfo.lightPushPeers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Store Peers</p>
                  <p className="text-lg font-semibold text-gray-800">{nodeInfo.storePeers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CountdownTimer countdown={nextMessageCountdown} />
        <SuccessIndicator success={lastSentSuccess} />
      </div>
    </div>
  );
}

export default App;