import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BlockPayload } from '@/lib/waku';

interface QRCodeProps {
  data: BlockPayload;
  size?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ data, size = 256 }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <QRCodeSVG value={JSON.stringify(data)} size={size} />
      <div className="text-sm text-muted-foreground">
        <p><strong>Title:</strong> {data.title}</p>
        <p><strong>Description:</strong> {data.description}</p>
        <p><strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleString()}</p>
        <p><strong>Signed Message:</strong> {`0x${data.signedMessage.slice(2, 6)}....${data.signedMessage.slice(-6)}`}</p>
      </div>
    </div>
  );
};

export default QRCode;
