import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

interface TelemetryOptInProps {
  onOptIn: (optIn: boolean) => void;
}

const TelemetryOptIn: React.FC<TelemetryOptInProps> = ({ onOptIn }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Telemetry Data Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We collect telemetry data to improve our services. This data is anonymous and helps us understand how our application is used. You can opt-in or opt-out of this data collection.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOptIn(false)}>Opt Out</Button>
          <Button onClick={() => onOptIn(true)}>Opt In</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TelemetryOptIn;
