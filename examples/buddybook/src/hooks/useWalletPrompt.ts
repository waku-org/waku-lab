import { useAccount, useConnect } from 'wagmi'

export function useWalletPrompt() {
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  const ensureWalletConnected = async () => {
    if (!isConnected) {
      try {
        const connector = connectors[0]
        if (connector) {
          // Check if we're on iOS
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
          
          // If on iOS, try to open MetaMask first
          if (isIOS) {
            // Attempt to open MetaMask
            window.location.href = 'metamask:///'
            
            // Give a small delay before attempting connection
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          
          await connect({ connector })
          
          // Wait a brief moment for the connection to be established
          await new Promise(resolve => setTimeout(resolve, 1000))
          return true
        }
      } catch (error) {
        console.error('Error connecting wallet:', error)
        // If connection fails, try to open MetaMask directly
        if (typeof window.ethereum === 'undefined') {
          // Redirect to MetaMask download page if not installed
          window.open('https://metamask.io/download/', '_blank')
        }
        return false
      }
    }
    return true
  }

  return { ensureWalletConnected }
} 