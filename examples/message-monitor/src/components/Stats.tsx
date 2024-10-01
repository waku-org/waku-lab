import React from 'react';

interface StatsProps {
  stats: {
    sent: number;
    received: number;
    selfReceived: number;
  };
}

const Stats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Stats</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-blue-600">Sent</p>
          <p className="text-2xl font-bold text-blue-800">{stats.sent}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-green-600">Received</p>
          <p className="text-2xl font-bold text-green-800">{stats.received}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-yellow-600">Self-Received</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.selfReceived}</p>
        </div>
      </div>
    </div>
  );
};

export default Stats;