import { AddSmsRequest, ConnectionInfoResponse, ListSmsQueryParams, ListSmsResponse, PairAcceptRequest, PairAcceptResponse, PairInfoResponse, PairInitiateRequest, PairInitiateResponse, UnpairResponse, UpdateConnectionStateRequest, UpdateConnectionStateResponse } from "./api";
import { ApiClient } from "./api-client";
export declare function pairInitiate(client: ApiClient, request: PairInitiateRequest): Promise<PairInitiateResponse>;
export declare function getPairInfo(client: ApiClient, connectionId: string): Promise<PairInfoResponse>;
export declare function pairAccept(client: ApiClient, connectionId: string, request: PairAcceptRequest): Promise<PairAcceptResponse>;
export declare function getConnectionInfo(client: ApiClient, connectionId: string): Promise<ConnectionInfoResponse>;
export declare function updateConnectionState(client: ApiClient, connectionId: string, request: UpdateConnectionStateRequest): Promise<UpdateConnectionStateResponse>;
export declare function listSms(client: ApiClient, connectionId: string, params: ListSmsQueryParams): Promise<ListSmsResponse>;
export declare function addSms(client: ApiClient, connectionId: string, request: AddSmsRequest): Promise<void>;
export declare function unpair(client: ApiClient, connectionId: string): Promise<UnpairResponse>;
