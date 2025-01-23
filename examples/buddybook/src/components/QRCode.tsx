import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface QRCodeProps {
  text: string;
  width?: number;
  height?: number;
  showCopyButton?: 'icon' | 'text' | 'both';
  title?: string;
  description?: string;
}

const QRCode: React.FC<QRCodeProps> = ({ 
  text, 
  width = 256, 
  height = 256,
  showCopyButton = 'both',
  title,
  description
}) => {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [qrSize, setQrSize] = useState(Math.min(width, height));

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
      setQrSize(
        window.innerWidth < 640 
          ? Math.min(window.innerWidth - 80, 200) 
          : Math.min(width, height)
      );
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [width, height]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Share Chain',
          text: description || 'Sign this chain',
          url: text
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      <div className="flex justify-center w-full">
        <QRCodeSVG 
          value={text} 
          size={qrSize}
          className="max-w-full"
        />
      </div>
      
      {showCopyButton !== 'text' && (
        <div className="flex items-center space-x-2 w-full">
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
      )}
      
      {showCopyButton === 'text' && (
        <Button
          onClick={isMobile && 'share' in navigator ? handleShare : handleCopy}
          variant="secondary"
          className="w-full sm:w-auto"
        >
          {isMobile && 'share' in navigator
            ? 'Share' 
            : copied 
              ? 'Copied!' 
              : 'Copy Link'}
        </Button>
      )}
    </div>
  );
};

export default QRCode;
