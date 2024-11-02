import { Protocols } from '@waku/sdk';

// Configure Waku options with browser-compatible settings
export const WAKU_NODE_OPTIONS = {
  defaultBootstrap: true,
  libp2p: {
    addresses: {
      listen: [] // Empty for browser environments
    },
    connectionManager: {
      minConnections: 2
    }
  },
  protocols: [Protocols.Store, Protocols.Filter, Protocols.LightPush]
}; 