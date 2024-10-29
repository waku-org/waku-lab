import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlockPayload } from '@/lib/waku';
import SignChain from './SignChain';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SignSharedChainProps {
  chainsData: BlockPayload[];
  onChainUpdate: (newBlock: BlockPayload) => void;
  isLoading: boolean;
}

const SignSharedChain: React.FC<SignSharedChainProps> = ({ chainsData, onChainUpdate, isLoading }) => {
  const { chainUUID, blockUUID } = useParams();
  const [block, setBlock] = useState<BlockPayload | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const foundBlock = chainsData.find(b => b.chainUUID === chainUUID && b.blockUUID === blockUUID);
    if (foundBlock) {
      setBlock(foundBlock);
    }
  }, [chainsData, chainUUID, blockUUID]);

  if (isLoading && !block) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Looking for chain...</p>
        </CardContent>
      </Card>
    );
  }

  if (!block) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Chain Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">The requested chain or block could not be found.</p>
          <Button onClick={() => navigate('/view')}>View All Chains</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Sign Shared Chain</CardTitle>
      </CardHeader>
      <CardContent>
        <h2 className="text-xl font-semibold mb-2">{block.title}</h2>
        <p className="mb-4">{block.description}</p>
        <SignChain 
          block={block} 
          chainsData={chainsData} 
          onSuccess={onChainUpdate} 
        />
      </CardContent>
    </Card>
  );
};

export default SignSharedChain;
