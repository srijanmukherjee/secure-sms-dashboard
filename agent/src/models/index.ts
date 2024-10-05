export type DeviceInfo = {
  brand: string;
  buildId: string;
  name: string;
};

export type AgentInfo = {
  deviceInfo: DeviceInfo;
  version: string;
};

export type ConnectionModel = {
  connectionId: string;
  agentInfo: AgentInfo;
  agentState: string;
  paired: boolean;
  pairedAt: number;
};

export type ContextModel = {
  key: string;
  value: string;
};
