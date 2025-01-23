import { IDecoder, IEncoder, LightNode, SDKProtocolResult, SubscribeResult } from "@waku/interfaces";
import { v4 as uuidv4 } from 'uuid';

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
  ) {
    this.start();
  }

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
    const isTelemetryOn = localStorage.getItem("telemetryOptIn");
    if (!isTelemetryOn || isTelemetryOn === "false" || isTelemetryOn !== "true" || !window.location.hostname.includes("buddybook.fun")) {
      return;
    }

    const telemetryRequests = messages.map((message) => ({
      id: ++this.requestId,
      telemetryType: message.type.toString(),
      telemetryData: message
    }));

    try {
      const res = await fetch(this.url, {
        method: "POST",
        body: JSON.stringify(telemetryRequests),
      });
      if (res.status !== 201) {
        console.log("DEBUG: Error sending messages to telemetry service: ", res.status, res.statusText, res.json);
        return false
      }
      return true;
    } catch (e) {
      console.log("DEBUG: Error sending messages to telemetry service", e);
      return false;
    }
  }
}

export const Telemetry = new TelemetryClient("https://telemetry.status.im/waku-metrics", 5000);

type ExtraData = {
  wallet?: string;
  bookId?: string;
  timeTaken?: number;
};

export const buildExtraData = ({
  wallet,
  bookId,
  timeTaken,
}: ExtraData): string => {
  return JSON.stringify({
    sdk: "@waku/react:0.0.7-9a7287d",
    wallet,
    bookId,
    timeTaken,
  });
};

type FromLightPush = {
  node: LightNode,
  timestamp: number,
  encoder: IEncoder,
  wallet: string,
  bookId: string,
  result: SDKProtocolResult,
}

export const fromLightPush = (data: FromLightPush): TelemetryPushFilter[] => {
  const telemetry: TelemetryPushFilter[] = [];

  data.result?.successes?.forEach((success) => {
    telemetry.push({
      type: TelemetryType.LIGHT_PUSH_FILTER,
      protocol: "lightPush",
      timestamp: data.timestamp,
      createdAt: data.timestamp,
      seenTimestamp: data.timestamp,
      peerId: success.toString(),
      contentTopic: data.encoder.contentTopic,
      pubsubTopic: data.encoder.pubsubTopic,
      ephemeral: false,
      messageHash: uuidv4(),
      errorMessage: "",
      extraData: buildExtraData({
        bookId: data.bookId,
        wallet: data.wallet,
      }),
    });
  });

  data.result?.failures?.forEach((fail) => {
    telemetry.push({
      type: TelemetryType.LIGHT_PUSH_FILTER,
      protocol: "lightPush",
      timestamp: data.timestamp,
      createdAt: data.timestamp,
      seenTimestamp: data.timestamp,
      peerId: fail?.peerId?.toString() || "missing",
      contentTopic: data.encoder.contentTopic,
      pubsubTopic: data.encoder.pubsubTopic,
      ephemeral: data.encoder.ephemeral,
      messageHash: uuidv4(),
      errorMessage: fail.error.toString(),
      extraData: buildExtraData({
        wallet: data.wallet,
        bookId: data.bookId,
      }),
    });
  });

  return telemetry;
};

type FromFilter = {
  result: SubscribeResult,
  node: LightNode,
  timestamp: number,
  decoder: IDecoder<any>,
};

export const fromFilter = (data: FromFilter): TelemetryPushFilter[] => {
  const telemetry: TelemetryPushFilter[] = [];
  const { error, results } = data.result;

  if (error) {
    telemetry.push({
      type: TelemetryType.LIGHT_PUSH_FILTER,
      protocol: "filter",
      timestamp: toInt(data.timestamp),
      createdAt: toInt(data.timestamp),
      seenTimestamp: toInt(data.timestamp),
      peerId: data.node.peerId.toString(),
      contentTopic: data.decoder.contentTopic,
      pubsubTopic: data.decoder.pubsubTopic,
      ephemeral: false,
      messageHash: uuidv4(),
      errorMessage: error,
      extraData: buildExtraData({}),
    });
  }

  results?.failures?.forEach((fail) => {
    telemetry.push({
      type: TelemetryType.LIGHT_PUSH_FILTER,
      protocol: "filter",
      timestamp: toInt(data.timestamp),
      createdAt: toInt(data.timestamp),
      seenTimestamp: toInt(data.timestamp),
      peerId: fail?.peerId?.toString() || "",
      contentTopic: data.decoder.contentTopic,
      pubsubTopic: data.decoder.pubsubTopic,
      ephemeral: false,
      messageHash: uuidv4(),
      errorMessage: fail?.error || "Unknown error",
      extraData: buildExtraData({}),
    });
  });

  results?.successes?.forEach((success) => {
    telemetry.push({
      type: TelemetryType.LIGHT_PUSH_FILTER,
      protocol: "filter",
      timestamp: toInt(data.timestamp),
      createdAt: toInt(data.timestamp),
      seenTimestamp: toInt(data.timestamp),
      peerId: success.toString(),
      contentTopic: data.decoder.contentTopic,
      pubsubTopic: data.decoder.pubsubTopic,
      ephemeral: false,
      messageHash: uuidv4(),
      errorMessage: "",
      extraData: buildExtraData({}),
    });
  });

  return telemetry;
};

type FromStore = {
  timestamp: number,
  timeTaken: number,
  node: LightNode,
  decoder: IDecoder<any>,
};

export const fromStore = (data: FromStore): TelemetryPushFilter[] => {
  return [{
    type: TelemetryType.LIGHT_PUSH_FILTER,
    protocol: "filter",
    timestamp: toInt(data.timestamp),
    createdAt: toInt(data.timestamp),
    seenTimestamp: toInt(data.timestamp),
    peerId: data.node.peerId.toString(),
    contentTopic: data.decoder.contentTopic,
    pubsubTopic: data.decoder.pubsubTopic,
    ephemeral: false,
    messageHash: uuidv4(),
    errorMessage: "",
    extraData: buildExtraData({
      timeTaken: data.timeTaken
    }),
  }];
};

export function toInt(v: any): number {
  return parseInt(v);
}