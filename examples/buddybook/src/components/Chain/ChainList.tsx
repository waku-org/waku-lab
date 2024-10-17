import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { type BlockPayload } from '@/lib/waku';

interface ChainListProps {
  chainsData: BlockPayload[];
}

const ChainList: React.FC<ChainListProps> = ({ chainsData }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Existing Chains</CardTitle>
      </CardHeader>
      <CardContent>
        {chainsData.length === 0 ? (
          <p>No chains found.</p>
        ) : (
          <ul className="space-y-4">
            {chainsData.map((chain, index) => (
              <li key={index}>
                <Card>
                  <CardHeader>
                    <CardTitle>{chain.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{chain.description}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Created at: {new Date(chain.timestamp).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ChainList;
