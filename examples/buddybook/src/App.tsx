import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import ChainCreationForm from './components/Chain/Creation/ChainCreationForm'
import { Button } from "@/components/ui/button"

function App() {
  const [showChainCreation, setShowChainCreation] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {showChainCreation ? (
          <ChainCreationForm />
        ) : (
          <div className="space-y-6 text-center">
            <h1 className="text-4xl font-bold">BuddyChain</h1>
            <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
              <Button 
                onClick={() => setShowChainCreation(true)}
                className="w-full mb-4"
              >
                Create New Chain
              </Button>
              <p className="text-muted-foreground">
                Click the button above to start creating a new chain.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Welcome to BuddyChain - Create and share your chains!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
