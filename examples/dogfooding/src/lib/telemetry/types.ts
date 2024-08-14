export enum TelemetryType {
    LIGHT_PUSH_FILTER = "LightPushFilter",
      LIGHT_PUSH_ERROR   = "LightPushError",
      GENERIC = "Generic"
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
  
  export interface TelemetryPushError extends TelemetryMessage {
    peerId: string;
    errorMessage: string;
    peerIdRemote?: string;
    contentTopic?: string;
    pubsubTopic?: string;
  }
  
  export interface TelemetryGeneric extends TelemetryMessage {
    peerId: string;
    metricType: string;
    contentTopic?: string;
    pubsubTopic?: string;
    genericData?: string;
    errorMessage?: string;
  }