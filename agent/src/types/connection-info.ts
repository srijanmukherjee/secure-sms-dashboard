export type DeviceInfo = {
  brand: string;
  buildId: string;
  name: string;
};

export type AgentInfo = {
  deviceInfo: DeviceInfo;
  supportedAlgorithms: string[];
  version: string;
};

export type ConnectionInfo = {
  connectionId: string;
  agentInfo: AgentInfo;
  agentState: string;
  paired: boolean;
  pairedAt: number;
};
