import React from 'react';
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { Status } from '@/App';

interface ConnectionStatusProps {
  filter: Status;
  store: Status;
}

const StatusIndicator: React.FC<{ status: Status; label: string }> = ({ status, label }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-500';
      case 'error':
        return 'bg-red-500/10 text-red-500';
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ filter, store }) => {
  return (
    <Card className="fixed bottom-4 left-4 right-4 md:static md:bottom-auto md:left-auto p-2 bg-background/80 backdrop-blur-sm border shadow-lg z-50 md:z-auto">
      <div className="flex flex-row justify-around md:justify-start md:gap-4">
        <StatusIndicator status={filter} label="Filter" />
        <StatusIndicator status={store} label="Store" />
      </div>
    </Card>
  );
};

export default ConnectionStatus; 