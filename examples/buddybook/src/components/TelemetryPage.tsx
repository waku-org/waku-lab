import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { privacyPolicy } from '@/lib/privacyPolicy';
import ReactMarkdown from 'react-markdown';


const TelemetryPage: React.FC = () => {
  const [telemetryOptIn, setTelemetryOptIn] = useState<boolean>(false);

  useEffect(() => {
    const storedOptIn = localStorage.getItem('telemetryOptIn');
    if (storedOptIn !== null) {
      setTelemetryOptIn(storedOptIn === 'true');
    }
  }, []);

  const handleToggleTelemetry = () => {
    const newOptIn = !telemetryOptIn;
    setTelemetryOptIn(newOptIn);
    localStorage.setItem('telemetryOptIn', newOptIn.toString());
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Telemetry Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              We collect telemetry data to improve our services. This data is anonymous and helps us understand how our application is used.
            </p>
            <p className="font-semibold mb-2">
              Current status: {telemetryOptIn ? 'Opted In' : 'Opted Out'}
            </p>
            <Button onClick={handleToggleTelemetry}>
              {telemetryOptIn ? 'Opt Out' : 'Opt In'}
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

export default TelemetryPage;
