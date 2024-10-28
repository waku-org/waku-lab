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
    <Card className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl sm:text-3xl">Privacy Policy Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              We collect data to improve our services. This data is anonymous and helps us understand how our application is used.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="font-semibold">
                Current status: {privacyPolicyOptIn ? 'Opted In' : 'Opted Out'}
              </p>
              <Button 
                onClick={handleTogglePrivacyPolicy}
                className="w-full sm:w-auto"
              >
                {privacyPolicyOptIn ? 'Opt Out' : 'Opt In'}
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Privacy Policy</h3>
            <ScrollArea className="h-[50vh] sm:h-[60vh] border rounded-md p-2 sm:p-4">
              <ReactMarkdown className="prose dark:prose-invert max-w-none text-sm sm:text-base">
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
