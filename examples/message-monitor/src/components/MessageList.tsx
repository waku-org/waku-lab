import React from 'react';
import { Message } from '../lib/telemetry/types';

interface MessageListProps {
  title: string;
  messages: Message[];
  showSequence: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ title, messages, showSequence }) => {
  const shortenMessage = (message: string) => {
    try {
      const parsed = JSON.parse(message);
      return parsed.content || message;
    } catch {
      return message;
    }
  };

  const getSequenceColor = (sequenceId: number) => {
    const colors = [
      'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 
      'bg-red-100', 'bg-indigo-100', 'bg-purple-100'
    ];
    return colors[sequenceId % colors.length];
  };

  const groupedMessages = showSequence
    ? messages.reduce((acc, message) => {
        if (!acc[message.sequenceId]) {
          acc[message.sequenceId] = [];
        }
        acc[message.sequenceId].push(message);
        return acc;
      }, {} as Record<number, Message[]>)
    : { 0: messages };

  // Sort sequences in descending order
  const sortedSequences = Object.entries(groupedMessages)
    .sort((a, b) => Number(b[0]) - Number(a[0]));

  if (messages.length === 0) {
    return (
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">{title}</h2>
        <div className="bg-gray-50 rounded-lg p-4 h-96 flex items-center justify-center">
          <p className="text-gray-500">Waiting for messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">{title}</h2>
      <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto border border-gray-200">
        {sortedSequences.map(([sequenceId, sequenceMessages]) => (
          <div key={sequenceId} className={`mb-4 p-2 rounded-lg ${showSequence ? getSequenceColor(Number(sequenceId)) : ''}`}>
            {showSequence && <div className="text-xs font-semibold mb-2">Sequence {sequenceId}</div>}
            {sequenceMessages
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((message: Message, index: number) => (
                <div key={index} className="text-sm mb-2 font-mono bg-white p-2 rounded shadow-sm">
                  {shortenMessage(message.content)}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageList;