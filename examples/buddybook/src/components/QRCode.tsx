import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface QRCodeProps {
  text: string;
  width?: number;
  height?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ text, width = 256, height = 256 }) => {
  const [copied, setCopied] = useState(false);
  const isMobile = window.innerWidth < 640;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <QRCodeSVG 
        value={text} 
        size={isMobile ? Math.min(width * 0.8, window.innerWidth - 64) : Math.min(width, height)} 
      />
      <div className="flex items-center space-x-2 w-full max-w-[300px]">
        <input 
          type="text" 
          value={text} 
          readOnly 
          className="flex-1 px-3 py-2 text-xs sm:text-sm border rounded-md bg-muted truncate"
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default QRCode;
