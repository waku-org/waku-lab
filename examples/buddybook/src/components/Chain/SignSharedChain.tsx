import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlockPayload } from '@/lib/waku';
import SignChain from './SignChain';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SignSharedChainProps {
  chainsData: BlockPayload[];
  onChainUpdate: (newBlock: BlockPayload) => void;
}

const SignSharedChain: React.FC<SignSharedChainProps> = ({ chainsData, onChainUpdate }) => {
  const { chainUUID, blockUUID } = useParams();
  const [block, setBlock] = useState<BlockPayload | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const foundBlock = chainsData.find(b => b.chainUUID === chainUUID && b.blockUUID === blockUUID);
    if (foundBlock) {
      setBlock(foundBlock);
    }
  }, [chainsData, chainUUID, blockUUID]);

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
