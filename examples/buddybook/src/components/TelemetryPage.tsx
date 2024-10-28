import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { privacyPolicy } from '@/lib/privacyPolicy';
import ReactMarkdown from 'react-markdown';


const PrivacyPolicyPage: React.FC = () => {
  const [privacyPolicyOptIn, setPrivacyPolicyOptIn] = useState<boolean>(false);

  useEffect(() => {
    const storedOptIn = localStorage.getItem('privacyPolicyOptIn');
    if (storedOptIn !== null) {
      setPrivacyPolicyOptIn(storedOptIn === 'true');
    }
  }, []);

  const handleTogglePrivacyPolicy = () => {
    const newOptIn = !privacyPolicyOptIn;
    setPrivacyPolicyOptIn(newOptIn);
    localStorage.setItem('privacyPolicyOptIn', newOptIn.toString());
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Privacy Policy Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              We collect data to improve our services. This data is anonymous and helps us understand how our application is used.
            </p>
            <p className="font-semibold mb-2">
              Current status: {privacyPolicyOptIn ? 'Opted In' : 'Opted Out'}
            </p>
            <Button onClick={handleTogglePrivacyPolicy}>
              {privacyPolicyOptIn ? 'Opt Out' : 'Opt In'}
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Privacy Policy</h3>
            <ScrollArea className="h-[60vh] border rounded-md p-4">
              <ReactMarkdown className="prose dark:prose-invert max-w-none">
                {privacyPolicy}
              </ReactMarkdown>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacyPolicyPage;
