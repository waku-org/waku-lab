import React, { useState, useEffect } from 'react';
import { useAccount, useSignMessage, useEnsName } from 'wagmi';
import type { LightNode } from '@waku/interfaces';
import { useWaku } from '@waku/react';
import { createMessage, encoder, BlockPayload } from '@/lib/waku';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import QRCode from '@/components/QRCode';
import { v4 as uuidv4 } from 'uuid';
import { useWalletPrompt } from '@/hooks/useWalletPrompt';

interface SignChainProps {
  block: BlockPayload;
  chainsData: BlockPayload[]; // Add this prop
  onSuccess: (newBlock: BlockPayload) => void;
}

const SignChain: React.FC<SignChainProps> = ({ block, chainsData, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { node } = useWaku<LightNode>();
  const { ensureWalletConnected } = useWalletPrompt();

  useEffect(() => {
    if (address) {
      // Check if the address has signed this block or any blocks in the chain
      const checkSignatures = (blockToCheck: BlockPayload): boolean => {
        // Check current block's signatures
        if (blockToCheck.signatures.some(
          sig => sig.address.toLowerCase() === address.toLowerCase()
        )) {
          return true;
        }

        // Check parent blocks
        const parentBlock = chainsData.find(b => b.blockUUID === blockToCheck.parentBlockUUID);
        if (parentBlock && checkSignatures(parentBlock)) {
          return true;
        }

        // Check child blocks
        const childBlocks = chainsData.filter(b => b.parentBlockUUID === blockToCheck.blockUUID);
        return childBlocks.some(childBlock => checkSignatures(childBlock));
      };

      const hasAlreadySigned = checkSignatures(block);
      setAlreadySigned(hasAlreadySigned);
    }
  }, [address, block, chainsData]);

  const { signMessage } = useSignMessage({
    mutation: {
      onMutate() {
        // Reset any previous errors when starting a new signing attempt
        setError(null);
        setIsSigning(true);
      },
      async onSuccess(signature) {
        if (!address || !node) return;
        
        try {
          // Double check signature before proceeding
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
        // If not connected, try to connect first
        const connected = await ensureWalletConnected();
        if (!connected) return;
      }
      
      // Check if already signed
      if (alreadySigned) {
        setError('You have already signed this chain.');
        return;
      }

      // Prepare the message
      const message = `Sign Block:
Chain UUID: ${block.chainUUID}
Block UUID: ${block.blockUUID}
Title: ${block.title}
Description: ${block.description}
Timestamp: ${new Date().getTime()}
Parent Block UUID: ${block.parentBlockUUID}
Signed by: ${ensName || address}`;

      // Trigger signing
      signMessage({ message });
    } catch (error) {
      console.error('Error in sign flow:', error);
      setError('Failed to initiate signing. Please try again.');
      setIsSigning(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} disabled={alreadySigned}>
        {alreadySigned ? 'Already Signed' : !address ? 'Connect Wallet' : 'Sign Chain'}
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Chain</DialogTitle>
            <DialogDescription>
              {alreadySigned 
                ? 'You have already signed this chain.'
                : 'Review the block details and sign to add your signature to the chain.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Block Details</h4>
              <p className="text-sm text-muted-foreground">{block.title}</p>
              <p className="text-sm text-muted-foreground">{block.description}</p>
            </div>
            <QRCode text={`${window.location.origin}/sign/${block.chainUUID}/${block.blockUUID}`} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSign} disabled={isSigning || alreadySigned}>
              {isSigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : alreadySigned ? (
                'Already Signed'
              ) : !address ? (
                'Connect Wallet'
              ) : (
                'Sign'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignChain;
