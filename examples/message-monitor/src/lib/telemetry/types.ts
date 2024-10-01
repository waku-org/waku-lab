export enum TelemetryType {
    LIGHT_PUSH_FILTER = "LightPushFilter",
  }
  
  export interface TelemetryRequest {
    id: number;
    telemetryType: TelemetryType;
    telemetryData: any;
  }
  
  export interface TelemetryMessage {
    type: string;
    timestamp: number;
    contentTopic: string;
    pubsubTopic: string;
    peerId: string;
    errorMessage: string;
    extraData: string;
  }
  
  export interface TelemetryPushFilter extends TelemetryMessage {
    type: "LightPushFilter";
    protocol: string;
    ephemeral: boolean;
    seenTimestamp: number;
    createdAt: number;
    messageHash: string;
  }

  export interface Message {
    content: string;
    sequenceId: number;
    timestamp: number;
  }