import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Telemetry Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          We collect telemetry data to improve our services. This data is anonymous and helps us understand how our application is used.
        </p>
        <p className="font-semibold">
          Current status: {telemetryOptIn ? 'Opted In' : 'Opted Out'}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleToggleTelemetry}>
          {telemetryOptIn ? 'Opt Out' : 'Opt In'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TelemetryPage;
