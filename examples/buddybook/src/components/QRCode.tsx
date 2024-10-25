import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  text: string;
  width?: number;
  height?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ text, width = 256, height = 256 }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <QRCodeSVG value={text} size={Math.min(width, height)} />
    </div>
  );
};

export default QRCode;
