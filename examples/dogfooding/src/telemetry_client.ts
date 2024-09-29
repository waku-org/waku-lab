export enum TelemetryType {
  LIGHT_PUSH_FILTER = "LightPushFilter",
}

interface TelemetryMessage {
  type: string;
  
  timestamp: number;
  contentTopic: string;
  pubsubTopic: string;
  peerId: string;
  errorMessage: string;
  extraData: string;
}

export interface TelemetryPushFilter extends TelemetryMessage {
  type: "LightPushFilter",
  protocol: string;
  ephemeral: boolean;
  seenTimestamp: number;
  createdAt: number;
  messageHash: string;
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
    return true;
  }
}
