import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BlockPayload } from '@/lib/waku';
import { Button } from '@/components/ui/button';
import { useEnsName } from 'wagmi';

interface QRCodeProps {
  data: BlockPayload;
  size?: number;
  onSign?: () => void;
}

const QRCode: React.FC<QRCodeProps> = ({ data, size = 256, onSign }) => {
  const shareableLink = `${window.location.origin}/view/${data.chainUUID}/${data.blockUUID}`;

  return (
    <div className="flex flex-col items-center space-y-4">
      <QRCodeSVG value={shareableLink} size={size} />
      <div className="text-sm text-muted-foreground">
        <p><strong>Title:</strong> {data.title}</p>
        <p><strong>Description:</strong> {data.description}</p>
        <p><strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleString()}</p>
        <p><strong>Signed Message:</strong> {`0x${data.signedMessage.slice(2, 6)}....${data.signedMessage.slice(-6)}`}</p>
        <p><strong>Parent Block:</strong> {data.parentBlockUUID || 'Root'}</p>
        <p><strong>Signatures:</strong></p>
        <ul>
          {data.signatures.map((sig, index) => (
            <SignatureItem key={index} address={sig.address} />
          ))}
        </ul>
      </div>
      <input 
        type="text" 
        value={shareableLink} 
        readOnly 
        className="w-full p-2 border rounded"
      />
      {onSign && <Button onClick={onSign}>Sign This Block</Button>}
    </div>
  );
};

const SignatureItem: React.FC<{ address: `0x${string}` }> = ({ address }) => {
  const { data: ensName } = useEnsName({ address });
  
  return (
    <li>
      {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
    </li>
  );
};

export default QRCode;
