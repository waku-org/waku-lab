import { useAccount, useConnect } from 'wagmi'

export function useWalletPrompt() {
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  const ensureWalletConnected = async () => {
    if (!isConnected) {
      try {
        // Find the first available connector (usually injected/metamask)
        const connector = connectors[0]
        if (connector) {
          await connect({ connector })
        }
        // Wait a brief moment for the connection to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true
      } catch (error) {
        console.error('Error connecting wallet:', error)
        return false
      }
    }
    return true
  }

  return { ensureWalletConnected }
} 