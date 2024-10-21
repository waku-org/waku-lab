import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { Button } from "@/components/ui/button";
import { useWaku } from "@waku/react";
import { Loader2 } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

// Add these new types
type Status = 'success' | 'in-progress' | 'error';

interface WakuStatus {
  filter: Status;
  store: Status;
}

interface HeaderProps {
  wakuStatus: WakuStatus;
}

const Header: React.FC<HeaderProps> = ({ wakuStatus }) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isLoading: isWakuLoading, error: wakuError, node: waku } = useWaku();
  const [connections, setConnections] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (waku) {
      const updateConnections = () => {
        setConnections(waku.libp2p.getConnections().length);
      };

      updateConnections();

      waku.libp2p.addEventListener("peer:connect", updateConnections);
      waku.libp2p.addEventListener("peer:disconnect", updateConnections);

      return () => {
        waku.libp2p.removeEventListener("peer:connect", updateConnections);
        waku.libp2p.removeEventListener("peer:disconnect", updateConnections);
      };
    }
  }, [waku]);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
    }
  };

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">BuddyBook</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link 
                  to="/create" 
                  className={`text-sm ${location.pathname === '/create' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                >
                  Create Chain
                </Link>
              </li>
              <li>
                <Link 
                  to="/view" 
                  className={`text-sm ${location.pathname === '/view' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                >
                  View Existing Chains
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">Filter:</span>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(wakuStatus.filter)}`}></div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">Store:</span>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(wakuStatus.store)}`}></div>
          </div>
          {isWakuLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : wakuError ? (
            <span className="text-sm text-red-500">Waku Error</span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Waku Connections: {connections}
            </span>
          )}
          {isConnected ? (
            <>
              <span className="text-sm text-muted-foreground">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Button variant="outline" size="sm" onClick={() => disconnect()}>
                Logout
              </Button>
            </>
          ) : (
            <ConnectKitButton />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
