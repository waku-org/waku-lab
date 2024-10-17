import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectKitButton } from 'connectkit';

const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
      <h1>BuddyBook</h1>
      <div>
        {isConnected ? (
          <div>
            <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button onClick={() => disconnect()}>Logout</button>
          </div>
        ) : (
          <ConnectKitButton />
        )}
      </div>
    </header>
  );
};

export default Header;
