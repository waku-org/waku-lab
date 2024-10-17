import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import App from './App.tsx'
import './index.css'
import { env } from './env'

const config = createConfig(
  getDefaultConfig({
    appName: 'BuddyBook',
    walletConnectProjectId: env.VITE_WALLETCONNECT_PROJECT_ID,
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(),
    },
  }),
)

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <App />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
