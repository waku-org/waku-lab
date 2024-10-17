import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ChainPreviewProps {
  title: string;
  description: string;
  asciiArt: string;
}

const ChainPreview: React.FC<ChainPreviewProps> = ({ title, description, asciiArt }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Chain Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-md overflow-x-auto">
          <pre className="text-sm">{asciiArt || 'ASCII art will appear here'}</pre>
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-semibold">{title || 'Chain Title'}</h4>
          <p className="text-muted-foreground">{description || 'Chain description will appear here'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChainPreview;
