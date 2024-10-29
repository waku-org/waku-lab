import { useAccount, useConnect } from 'wagmi'

export function useWalletPrompt() {
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  const ensureWalletConnected = () => {
    if (!isConnected) {
      // Find the first available connector (usually injected/metamask)
      const connector = connectors[0]
      if (connector) {
        connect({ connector })
      }
      return false
    }
    return true
  }

  return { ensureWalletConnected }
} 