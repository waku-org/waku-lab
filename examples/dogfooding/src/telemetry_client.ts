export enum TelemetryType {
  LIGHT_PUSH_FILTER = "LightPushFilter",
}

// Top level structure of a telemetry request
export interface TelemetryRequest {
  id: number;
  telemetryType: TelemetryType;
  telemetryData: any; // Using 'any' to represent the raw JSON data
}

// Common to all telemetry messages
export interface TelemetryMessage {
  timestamp: number;
  messageType: TelemetryType;
}

export interface TelemetryPushFilter extends TelemetryMessage {
  peerIdSender: string;
  peerIdReporter: string;
  sequenceHash: string;
  sequenceTotal: number;
  sequenceIndex: number;
  contentTopic: string;
  pubsubTopic: string;
}


export class TelemetryClient {
  constructor(
    private readonly url: string,
    private intervalPeriod: number = 5000
  ) {}

  private queue: TelemetryMessage[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private requestId = 0;

  public push<T extends TelemetryMessage>(messages: T[]) {
    this.queue.push(...messages);
  }

  public async start() {
    if (!this.intervalId) {
      this.intervalId = setInterval(async () => {
        if (this.queue.length > 0) {
          const success = await this.send(this.queue);
          if (success) {
            console.log("Sent ", this.queue.length, " telemetry logs");
            this.queue = [];
          }
        }
      }, this.intervalPeriod);
    }
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  private async send<T extends TelemetryMessage>(messages: T[]) {
    const telemetryRequests = messages.map((message) => ({
      id: ++this.requestId,
      telemetryType: message.messageType.toString(),
      telemetryData: message
    }));

    try {
      const res = await fetch(this.url, {
        method: "POST",
        body: JSON.stringify(telemetryRequests),
      });
      if (res.status !== 201) {
        console.error("Error sending messages to telemetry service: ", res.status, res.statusText, res.json);
        return false
      }
      return true;
    } catch (e) {
      console.error("Error sending messages to telemetry service: ", e);
      console.error("Failed trying to send the following messages: ", telemetryRequests);
      return false;
    }
  }
}
