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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="h-14">
          <div className="flex h-14 items-center justify-between gap-4">
            <nav className="flex items-center gap-2 md:gap-4">
              <Link 
                to="" 
                className={`text-sm font-medium ${location.pathname === "" ? "text-foreground" : "text-muted-foreground"}`}
              >
                Home
              </Link>
              <Link 
                to="create" 
                className={`text-sm font-medium ${location.pathname === "/create" ? "text-foreground" : "text-muted-foreground"}`}
              >
                Create
              </Link>
              <Link 
                to="view" 
                className={`text-sm font-medium ${location.pathname === "/view" ? "text-foreground" : "text-muted-foreground"}`}
              >
                View
              </Link>
            </nav>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                {!isWakuLoading && !wakuError && (
                  <>
                    <div className="flex items-center space-x-1">
                      <span className="hidden md:inline text-muted-foreground">Connection:</span>
                      <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${getStatusColor(wakuStatus.filter)}`}></div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="hidden md:inline text-muted-foreground">History:</span>
                      <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${getStatusColor(wakuStatus.store)}`}></div>
                    </div>
                    <div className="flex items-center space-x-1 hidden">
                      <span className="hidden md:inline text-muted-foreground">Peers:</span>
                      {isWakuLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : wakuError ? (
                        <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500`} />
                      ) : (
                        <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${connections > 0 ? "bg-green-500" : "bg-yellow-500"}`} />
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm text-muted-foreground truncate max-w-[80px] md:max-w-[120px]">
                      {ensName || (address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '')}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => disconnect()}>
                      <span className="md:hidden">×</span>
                      <span className="hidden md:inline">Logout</span>
                    </Button>
                  </div>
                ) : (
                  <ConnectKitButton />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
