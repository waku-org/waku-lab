import { Protocols } from '@waku/sdk';

export const WAKU_NODE_OPTIONS = {
  defaultBootstrap: true,
  protocols: [Protocols.Store, Protocols.Filter, Protocols.LightPush]
}; 