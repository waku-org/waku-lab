import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type BlockPayload } from '@/lib/waku';
import QRCode from '@/components/QRCode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ChainListProps {
  chainsData: BlockPayload[];
}

const ChainList: React.FC<ChainListProps> = ({ chainsData }) => {
  const [selectedChain, setSelectedChain] = useState<BlockPayload | null>(null);

  const handleShowQR = (chain: BlockPayload) => {
    setSelectedChain(chain);
  };

  const handleCloseQR = () => {
    setSelectedChain(null);
  };

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
                    <Button onClick={() => handleShowQR(chain)} className="mt-2">
                      Show QR Code
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <Dialog open={!!selectedChain} onOpenChange={handleCloseQR}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedChain?.title} QR Code</DialogTitle>
          </DialogHeader>
          {selectedChain && (
            <QRCode data={selectedChain} />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ChainList;
