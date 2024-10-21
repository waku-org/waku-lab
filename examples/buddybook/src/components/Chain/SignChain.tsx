import React, { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import type { LightNode } from '@waku/interfaces';
import { useWaku } from '@waku/react';
import { createMessage, encoder, BlockPayload } from '@/lib/waku';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import QRCode from '@/components/QRCode';
import { v4 as uuidv4 } from 'uuid';

interface SignChainProps {
  block: BlockPayload;
  onSuccess: (newBlock: BlockPayload) => void;
}

const SignChain: React.FC<SignChainProps> = ({ block, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const { node } = useWaku<LightNode>();
  const { signMessage } = useSignMessage({
    mutation: {
      async onSuccess(signature) {
        if (!address || !node) return;
        
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

        try {
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
        } finally {
          setIsSigning(false);
        }
      },
      onError(error) {
        console.error('Error signing message:', error);
        setError('Error signing message. Please try again.');
        setIsSigning(false);
      }
    }
  });

  const handleSign = () => {
    setIsSigning(true);
    setError(null);
    const message = `Sign Block:
                    Chain UUID: ${block.chainUUID}
                    Block UUID: ${block.blockUUID}
                    Title: ${block.title}
                    Description: ${block.description}
                    Timestamp: ${new Date().getTime()}
                    Parent Block UUID: ${block.parentBlockUUID}
                    Signed by: ${address}`;
    signMessage({ message });
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Sign Chain</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Chain</DialogTitle>
          </DialogHeader>
          <QRCode data={block} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSign} disabled={isSigning}>
              {isSigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
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
