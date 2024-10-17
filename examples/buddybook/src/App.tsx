import React, { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import ChainCreationForm from './components/Chain/CreationPreview'
import ChainList from './components/Chain/ChainList'
import { Button } from "@/components/ui/button"
import { type LightNode } from "@waku/sdk"
import { useWaku } from "@waku/react"
import { Loader2 } from "lucide-react"
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { BlockPayload, getMessagesFromStore, subscribeToFilter } from './lib/waku'

function App() {
  const [chainsData, setChainsData] = useState<BlockPayload[]>([])
  const { isLoading: isWakuLoading, error: wakuError, node } = useWaku();
  
  useEffect(() => {
    if (isWakuLoading || !node || node.libp2p.getConnections().length === 0) return;
    const startMessageListening = async () => {
      console.log("Starting message listening")
      const storeMessages = await getMessagesFromStore(node as LightNode)
      setChainsData(storeMessages)
      await subscribeToFilter(node as LightNode, (message) => {
        setChainsData((prevChainsData) => [...prevChainsData, message]);
      })
    }
    startMessageListening();
  }, [node, isWakuLoading])

  if (isWakuLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (wakuError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center">
        <p className="text-red-500">Error connecting to Waku network</p>
        <p className="text-sm text-muted-foreground">{wakuError.toString()}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/create" element={<ChainCreationForm />} />
          <Route path="/view" element={<ChainList chainsData={chainsData} />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

const Home: React.FC = () => (
  <div className="space-y-6 text-center">
    <h1 className="text-4xl font-bold">BuddyChain</h1>
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
      <Link to="/create">
        <Button 
          className="w-full mb-4"
        >
          Create New Chain
        </Button>
      </Link>
      <p className="text-muted-foreground">
        Click the button above to start creating a new chain.
      </p>
    </div>
    <p className="text-sm text-muted-foreground">
      Welcome to BuddyChain - Create and share your chains!
    </p>
  </div>
)

export default App
