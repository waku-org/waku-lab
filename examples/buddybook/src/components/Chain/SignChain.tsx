import React, { useState, useEffect } from 'react';
import { useAccount, useSignMessage, useEnsName } from 'wagmi';
import type { LightNode } from '@waku/interfaces';
import { useWaku } from '@waku/react';
import { createMessage, encoder, BlockPayload } from '@/lib/waku';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import QRCode from '@/components/QRCode';
import { useWalletPrompt } from '@/hooks/useWalletPrompt';
import { v4 as uuidv4 } from 'uuid';

interface SignChainProps {
  block: BlockPayload;
  chainsData: BlockPayload[];
  onSuccess: (newBlock: BlockPayload) => void;
}

const SignChain: React.FC<SignChainProps> = ({ block, chainsData, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [isWalletPrompt, setIsWalletPrompt] = useState(false);

  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { node } = useWaku<LightNode>();
  const { ensureWalletConnected } = useWalletPrompt();

  const checkSignatures = (blockToCheck: BlockPayload, visitedBlocks: Set<string>): boolean => {
    if (visitedBlocks.has(blockToCheck.blockUUID)) return false;
    visitedBlocks.add(blockToCheck.blockUUID);

    // Check current block signatures
    if (blockToCheck.signatures?.some(sig => sig?.address?.toLowerCase() === address?.toLowerCase())) {
      return true;
    }

    // Check parent block
    const parentBlock = chainsData.find(b => b.blockUUID === blockToCheck.parentBlockUUID);
    if (parentBlock && checkSignatures(parentBlock, visitedBlocks)) {
      return true;
    }

    // Check immediate child blocks
    return chainsData
      .filter(b => b.parentBlockUUID === blockToCheck.blockUUID)
      .some(childBlock => checkSignatures(childBlock, visitedBlocks));
  };

  useEffect(() => {
    if (!address) return;

    try {
      const visitedBlocks = new Set<string>();
      setAlreadySigned(checkSignatures(block, visitedBlocks));
    } catch (error) {
      console.error('Error in signature check:', error);
      setAlreadySigned(false);
    }
  }, [address, block, chainsData]);

  const { signMessage } = useSignMessage({
    mutation: {
      onMutate() {
        setError(null);
        setIsSigning(true);
      },
      async onSuccess(signature) {
        if (!address || !node) return;
        
        try {
          if (block.signatures.some(sig => sig.address.toLowerCase() === address.toLowerCase())) {
            setError('You have already signed this chain.');
            return;
          }

          const newBlock: BlockPayload = {
            chainUUID: block.chainUUID,
            blockUUID: uuidv4(),
            title: block.title,
            description: block.description,
            signedMessage: signature,
            timestamp: Date.now(),
            signatures: [{ address, signature }],
            parentBlockUUID: block.blockUUID
          };

          const wakuMessage = createMessage(newBlock);
          const { failures, successes } = await node.lightPush.send(encoder, wakuMessage);
          
          if (failures.length > 0 || successes.length === 0) {
            throw new Error('Failed to send message to Waku network');
          }

          onSuccess(newBlock);
          setIsOpen(false);
        } catch (error) {
          console.error('Error creating new block:', error);
          setError('Failed to create new block. Please try again.');
        }
      },
      onError(error) {
        console.error('Error signing message:', error);
        setError('Error signing message. Please try again. If using a mobile wallet, please ensure your wallet app is open.');
      },
      onSettled() {
        setIsSigning(false);
      }
    }
  });

  const handleSign = async () => {
    try {
      if (!address) {
        setIsWalletPrompt(true);
        const connected = await ensureWalletConnected();
        if (!connected) {
          setError('Please ensure your wallet is connected and the app is open.');
          return;
        }
      }
      
      if (alreadySigned) {
        setError('You have already signed this chain.');
        return;
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && typeof window.ethereum === 'undefined') {
        setError('Please ensure your wallet app is installed and open before signing.');
        window.location.href = 'metamask:///';
        return;
      }

      const message = [
        'Sign Block:',
        `Chain UUID: ${block.chainUUID}`,
        `Block UUID: ${block.blockUUID}`,
        `Title: ${block.title}`,
        `Description: ${block.description}`,
        `Timestamp: ${new Date().getTime()}`,
        `Parent Block UUID: ${block.parentBlockUUID}`,
        `Signed by: ${ensName || address}`
      ].join('\n');

      signMessage({ message });
    } catch (error) {
      console.error('Error in sign flow:', error);
      setError('Failed to initiate signing. Please ensure your wallet app is open and try again.');
      setIsSigning(false);
    } finally {
      setIsWalletPrompt(false);
    }
  };

  const getButtonText = () => {
    if (isSigning) return 'Signing...';
    if (isWalletPrompt) return 'Connecting...';
    if (alreadySigned) return 'Already Signed';
    if (!address) return 'Connect Wallet';
    return 'Sign';
  };

  const showLoadingSpinner = isSigning || isWalletPrompt;

  return (
    <>
      <Button onClick={() => setIsOpen(true)} disabled={alreadySigned}>
        {alreadySigned ? 'Already Signed' : !address ? 'Connect Wallet' : 'Sign Chain'}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh] md:max-h-[85vh]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Sign Chain</DialogTitle>
            <DialogDescription>
              {alreadySigned 
                ? 'You have already signed this chain.'
                : 'Review the block details and sign to add your signature to the chain.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Block Details</h4>
                <p className="text-sm text-muted-foreground">{block.title}</p>
                <p className="text-sm text-muted-foreground">{block.description}</p>
              </div>
              <div className="flex justify-center">
                <QRCode text={`${window.location.origin}/sign/${block.chainUUID}/${block.blockUUID}`} />
              </div>
            </div>
            {(error || isWalletPrompt) && (
              <div className="space-y-2 mt-4">
                {error && <p className="text-sm text-destructive">{error}</p>}
                {isWalletPrompt && (
                  <div className="rounded-md bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">Attempting to connect to your wallet...</p>
                    <p className="text-xs text-blue-600 mt-1">
                      If your wallet doesn't open automatically, please open it manually to approve the connection.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex-shrink-0 mt-4">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSign} 
              disabled={isSigning || alreadySigned || isWalletPrompt}
            >
              {showLoadingSpinner && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getButtonText()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignChain;
