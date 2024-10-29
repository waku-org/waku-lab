import React from 'react';
import { Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import { type BlockPayload } from '@/lib/waku';
import SignChain from '@/components/Chain/SignChain';
import { useEnsName } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import QRCode from '@/components/QRCode';
import { Loader2 } from "lucide-react";

interface ChainListProps {
  chainsData: BlockPayload[];
  onChainUpdate: (newBlock: BlockPayload) => void;
  isLoading: boolean;
}

const ChainList: React.FC<ChainListProps> = ({ chainsData, onChainUpdate, isLoading }) => {
  const handleChainUpdate = (newBlock: BlockPayload) => {
    onChainUpdate(newBlock);
  };

  const renderBlock = (block: BlockPayload, depth: number = 0) => {
    const childBlocks = chainsData.filter(b => b.parentBlockUUID === block.blockUUID);
    const totalSignatures = block.signatures.length + childBlocks.reduce((acc, child) => acc + child.signatures.length, 0);

    const shareUrl = `${window.location.origin}/sign/${block.chainUUID ?? block.blockUUID}/${block.blockUUID}`;

    return (
      <li key={`${block.blockUUID}-${depth}`} className="mb-4">
        <div className="flex items-start">
          <div className="mr-4 mt-2">
            {depth > 0 && (
              <div className="w-6 h-6 border-l-2 border-b-2 border-gray-300"></div>
            )}
          </div>
          {depth === 0 ? (
            <Card className="flex-grow">
              <CardHeader>
                <CardTitle>{block.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{block.description}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Created at: {new Date(block.timestamp).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Signatures: {totalSignatures}
                </p>
                <p className="text-sm text-muted-foreground">
                  Block UUID: {block.blockUUID}
                </p>
                <div className="mt-2 space-x-2">
                  <SignChain 
                    block={block} 
                    chainsData={chainsData} 
                    onSuccess={handleChainUpdate} 
                  />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Share</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Share this Chain</DialogTitle>
                        <DialogDescription>
                          Share this chain with others to collect their signatures.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center space-y-4">
                        <QRCode text={shareUrl} width={200} height={200} />
                        <p className="text-sm text-center break-all">{shareUrl}</p>
                        <Button
                          onClick={() => navigator.clipboard.writeText(shareUrl)}
                          variant="outline"
                        >
                          Copy Link
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex-grow">
              <SignerName address={block.signatures[0].address} />
            </div>
          )}
        </div>
        {childBlocks.length > 0 && (
          <ul className="ml-8 mt-2">
            {childBlocks.map((childBlock) => renderBlock(childBlock, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  const rootBlocks = chainsData.filter(block => !block.parentBlockUUID);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Loading Chains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Fetching chains from the network...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          Existing Chains
          {isLoading && (
            <span className="ml-2 inline-flex items-center text-muted-foreground text-sm font-normal">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading more chains...
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rootBlocks.length === 0 ? (
          <p>No chains found.</p>
        ) : (
          <ul className="space-y-4">
            {rootBlocks.map((block) => renderBlock(block, 0))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

const SignerName: React.FC<{ address: `0x${string}` }> = ({ address }) => {
  const { data: ensName } = useEnsName({ address })
  
  return (
    <p className="text-sm">
      Signed by: {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
    </p>
  );
};

export default ChainList;
