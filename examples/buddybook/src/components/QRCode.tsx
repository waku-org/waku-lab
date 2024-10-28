import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface QRCodeProps {
  data?: any;
  text?: string;
  width?: number;
  height?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ data, text, width = 256, height = 256 }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = text || (data ? `${window.location.origin}/sign/${data.chainUUID}/${data.blockUUID}` : '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <QRCodeSVG value={shareUrl} size={Math.min(width, height)} />
      <div className="flex items-center space-x-2">
        <input 
          type="text" 
          value={shareUrl} 
          readOnly 
          className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default QRCode;
