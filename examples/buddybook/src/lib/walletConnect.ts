import { mainnet } from 'wagmi/chains'
import { createConfig, http } from 'wagmi'
import { getDefaultConfig } from 'connectkit'

// Try multiple ways to get the project ID
const projectId = 
  process.env.VITE_WALLETCONNECT_PROJECT_ID || 
  window.process?.env?.VITE_WALLETCONNECT_PROJECT_ID ||
  'dd346811b5dd8a8f7d471df7c571dd92' // Fallback to hardcoded value if all else fails

if (!projectId) {
  throw new Error('Missing VITE_WALLETCONNECT_PROJECT_ID environment variable')
}

export const config = createConfig(
  getDefaultConfig({
    appName: 'BuddyBook',
    walletConnectProjectId: projectId,
    chains: [mainnet],
    transports: {
      [mainnet.id]: http(),
    },
  }),
)
