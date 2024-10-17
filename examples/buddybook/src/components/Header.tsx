import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { Button } from "@/components/ui/button";
import { useWaku } from "@waku/react";
import { Loader2 } from "lucide-react";

const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isLoading: isWakuLoading, error: wakuError, node: waku } = useWaku();
  const [connections, setConnections] = useState(0);

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

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">BuddyBook</h1>
        <div className="flex items-center space-x-2">
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
