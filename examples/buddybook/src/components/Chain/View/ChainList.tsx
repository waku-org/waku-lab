import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { type BlockPayload } from '@/lib/waku';
import SignChain from '@/components/Chain/SignChain';
import { useEnsName } from 'wagmi';

interface ChainListProps {
  chainsData: BlockPayload[];
  onChainUpdate: (newBlock: BlockPayload) => void;
}

const ChainList: React.FC<ChainListProps> = ({ chainsData, onChainUpdate }) => {
  const handleChainUpdate = (newBlock: BlockPayload) => {
    onChainUpdate(newBlock);
  };

  const renderBlock = (block: BlockPayload, depth: number = 0) => {
    const childBlocks = chainsData.filter(b => b.parentBlockUUID === block.blockUUID);
    const totalSignatures = block.signatures.length + childBlocks.reduce((acc, child) => acc + child.signatures.length, 0);

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
                <div className="mt-2">
                  <SignChain block={block} onSuccess={handleChainUpdate} />
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Existing Chains</CardTitle>
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
