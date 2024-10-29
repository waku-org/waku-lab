import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';
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
  const { data: ensName } = useEnsName({ address });

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
    <header className="border-b">
      <div className="container mx-auto px-4 py-2 md:py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <h1 className="text-xl md:text-2xl font-bold">BuddyBook</h1>
            <nav className="w-full md:w-auto">
              <ul className="flex justify-center md:justify-start space-x-4">
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
                    View Chains
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/telemetry" 
                    className={`text-sm ${location.pathname === '/telemetry' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                  >
                    Telemetry
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 w-full md:w-auto">
            <div className="flex items-center space-x-2 text-xs md:text-sm">
              {isWakuLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Connecting...</span>
                </div>
              ) : wakuError ? (
                <span className="text-destructive">Network Error</span>
              ) : (
                <>
                  <div className="flex items-center space-x-1">
                    <span className="text-muted-foreground">Filter:</span>
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${getStatusColor(wakuStatus.filter)}`}></div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-muted-foreground">Store:</span>
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${getStatusColor(wakuStatus.store)}`}></div>
                  </div>
                  <span className="text-xs md:text-sm text-muted-foreground hidden md:inline">
                    {connections > 0 ? `${connections} peer${connections === 1 ? '' : 's'}` : 'Connecting...'}
                  </span>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {isWakuLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : wakuError ? (
                <span className="text-xs md:text-sm text-red-500">Waku Error</span>
              ) : (
                <span className="text-xs md:text-sm text-muted-foreground hidden md:inline">
                  Waku Connections: {connections}
                </span>
              )}
              
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs md:text-sm text-muted-foreground truncate max-w-[120px] md:max-w-none">
                    {ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '')}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => disconnect()}>
                    Logout
                  </Button>
                </div>
              ) : (
                <ConnectKitButton />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
