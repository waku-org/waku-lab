import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { privacyPolicy } from '@/lib/privacyPolicy';
import ReactMarkdown from 'react-markdown';

interface PrivacyPolicyOptInProps {
  onOptIn: (optIn: boolean) => void;
}

const PrivacyPolicyOptIn: React.FC<PrivacyPolicyOptInProps> = ({ onOptIn }) => {
  const [showFullPolicy, setShowFullPolicy] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl sm:text-2xl">Privacy Policy & Data Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              We collect data to improve our services. This data is anonymous and helps us understand how our application is used. You can opt-in or opt-out of this data collection.
            </p>
            <Button 
              variant="link" 
              onClick={() => setShowFullPolicy(true)}
              className="px-0 text-sm sm:text-base"
            >
              View Full Privacy Policy
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            onClick={() => onOptIn(false)}
            className="w-full sm:w-auto"
          >
            Opt Out
          </Button>
          <Button 
            onClick={() => onOptIn(true)}
            className="w-full sm:w-auto"
          >
            Opt In
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showFullPolicy} onOpenChange={setShowFullPolicy}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Privacy Policy</DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 h-[50vh] sm:h-[60vh]">
            <DialogDescription className="space-y-4">
              <ReactMarkdown className="prose dark:prose-invert max-w-none text-sm sm:text-base">
                {privacyPolicy}
              </ReactMarkdown>
            </DialogDescription>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrivacyPolicyOptIn;
