import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">BuddyBook</h1>
        <div>
          {isConnected ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {address?.slice(0, 6)}...{address?.slice(-4)}
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
    </header>
  );
};

export default Header;
