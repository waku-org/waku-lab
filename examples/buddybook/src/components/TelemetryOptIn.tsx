import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { privacyPolicy } from '@/lib/privacyPolicy';
import ReactMarkdown from 'react-markdown';

interface TelemetryOptInProps {
  onOptIn: (optIn: boolean) => void;
}

const TelemetryOptIn: React.FC<TelemetryOptInProps> = ({ onOptIn }) => {
  const [showFullPolicy, setShowFullPolicy] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Telemetry Data Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We collect telemetry data to improve our services. This data is anonymous and helps us understand how our application is used. You can opt-in or opt-out of this data collection.
          </p>
          <Button variant="link" onClick={() => setShowFullPolicy(true)}>
            View Full Privacy Policy
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOptIn(false)}>Opt Out</Button>
          <Button onClick={() => onOptIn(true)}>Opt In</Button>
        </CardFooter>
      </Card>

      <Dialog open={showFullPolicy} onOpenChange={setShowFullPolicy}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 h-[60vh]">
            <DialogDescription className="space-y-4">
              <ReactMarkdown className="prose dark:prose-invert max-w-none">
                {privacyPolicy}
              </ReactMarkdown>
            </DialogDescription>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TelemetryOptIn;
