import { mainnet } from 'wagmi/chains'
import {  createConfig, http } from 'wagmi'
import {  getDefaultConfig } from 'connectkit'
import { env } from '@/env'

export const config = createConfig(
    getDefaultConfig({
      appName: 'BuddyBook',
      walletConnectProjectId: env.VITE_WALLETCONNECT_PROJECT_ID,
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(),
      },
    }),
  )