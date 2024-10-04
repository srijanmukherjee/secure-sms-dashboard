export declare enum ApiStatusCode {
    OK = "OK",
    BAD_REQUEST = "BAD_REQUEST",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    NOT_FOUND = "NOT_FOUND",
    PAIRING_REQUEST_EXPIRED = "PAIRING_REQUEST_EXPIRED"
}
export declare enum HttpStatusCode {
    OK = 200,
    CREATED = 201
}
export interface ApiResponse<Data = any> {
    statusCode: ApiStatusCode;
    data: Data;
    requestId: string;
    message: string;
}
export type IpLocation = {
    continent: string;
    continentCode: string;
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    zip: string;
};
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
export declare enum AgentConnectionState {
    SERVICE_ACTIVE = "SERVICE_ACTIVE",
    SERVICE_INACTIVE = "SERVICE_INACTIVE"
}
export type Sms = {
    timestamp: number;
    payload: string;
};
export type PairInitiateRequest = {
    publicKey: string;
    supportedAlgorithms: string[];
};
export type PairInitiateResponse = {
    connectionId: string;
    expiresAt: number;
};
export type PairInfoResponse = {
    connectionId: string;
    userAgent: string;
    location: IpLocation;
    supportedAlgorithms: string[];
    publicKey: string;
    expiresAt: number;
    paired: boolean;
};
export type PairAcceptRequest = {
    deviceInfo: DeviceInfo;
    supportedAlgorithms: string[];
    agentVersion: string;
};
export type PairAcceptResponse = {
    connectionId: string;
};
export type ConnectionInfoResponse = {
    connectionId: string;
    agentInfo: AgentInfo;
    agentState: string;
    paired: boolean;
    pairedAt: number;
};
export type UpdateConnectionStateRequest = {
    state: AgentConnectionState;
};
export type UpdateConnectionStateResponse = {
    connectionId: string;
    state: AgentConnectionState;
};
export type ListSmsQueryParams = {
    limit?: number;
    before?: number;
    after?: number;
};
export type ListSmsResponse = Sms[];
export type AddSmsRequest = {
    payload: string;
};
export type UnpairResponse = {
    connectionId: string;
};
