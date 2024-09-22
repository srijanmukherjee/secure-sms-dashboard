import { AddSmsRequest, ApiResponse, ApiStatusCode, ConnectionInfoResponse, HttpStatusCode, ListSmsQueryParams, ListSmsResponse, PairAcceptRequest, PairAcceptResponse, PairInfoResponse, PairInitiateRequest, PairInitiateResponse, UnpairResponse, UpdateConnectionStateRequest, UpdateConnectionStateResponse } from "./api";
import { ApiClient, HttpResponse } from "./api-client";
import { ApiEndpoint } from "./api-endpoint";
import { ApiConnectorException, Exception } from "./exception";

export function pairInitiate(client: ApiClient, request: PairInitiateRequest): Promise<PairInitiateResponse> {
    return callApi(client.post(ApiEndpoint.pairInitiate, request));
}

export function getPairInfo(client: ApiClient, connectionId: string): Promise<PairInfoResponse> {
    return callApi(client.get(ApiEndpoint.pairInfo.replace(':connectionId', connectionId)));
}

export function pairAccept(client: ApiClient, connectionId: string, request: PairAcceptRequest): Promise<PairAcceptResponse> {
    return callApi(client.post(ApiEndpoint.pairAccept.replace(':connectionId', connectionId), request));
}

export function getConnectionInfo(client: ApiClient, connectionId: string): Promise<ConnectionInfoResponse> {
    return callApi(client.get(ApiEndpoint.connectionInfo.replace(':connectionId', connectionId)));
}

export function updateConnectionState(client: ApiClient, connectionId: string, request: UpdateConnectionStateRequest): Promise<UpdateConnectionStateResponse> {
    return callApi(client.post(ApiEndpoint.updateConnection.replace(':connectionId', connectionId), request));
}

export function listSms(client: ApiClient, connectionId: string, params: ListSmsQueryParams): Promise<ListSmsResponse> {
    const queryParams = new URLSearchParams();

    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.after !== undefined) queryParams.append('after', params.after.toString());
    if (params.before !== undefined) queryParams.append('before', params.before.toString());

    const separator = queryParams.size === 0 ? '' : '?';
    const endpoint = `${ApiEndpoint.listSms.replace(':connectionId', connectionId)}${separator}${queryParams.toString()}`

    return callApi(client.get(endpoint));
}

export function addSms(client: ApiClient, connectionId: string, request: AddSmsRequest): Promise<void> {
    return callApi(client.post(ApiEndpoint.addSms.replace(':connectionId', connectionId), request), true, HttpStatusCode.CREATED);
}

export function unpair(client: ApiClient, connectionId: string): Promise<UnpairResponse> {
    return callApi(client.get(ApiEndpoint.unpair.replace(':connectionId', connectionId)));
}

async function callApi<Data>(apiCall: Promise<HttpResponse<ApiResponse<Data>>>, httpStatusCodeOnly: boolean = false, successStatusCode: HttpStatusCode = HttpStatusCode.OK) {
    try {
        const response = await apiCall;
        if (httpStatusCodeOnly && response.statusCode === successStatusCode) {
            return response.body.data;
        } else if (!httpStatusCodeOnly && response.statusCode === successStatusCode && response.body.statusCode === ApiStatusCode.OK) {
            return response.body.data;
        }

        throw new ApiConnectorException(response);
    } catch (error) {
        if (error instanceof Error) {
            throw new Exception(
                `failed to invoke endpoint due to ${error.message}`,
                error
            );
        } else if (typeof error === 'string') {
            throw new Exception(
                `failed to invoke endpoint due to ${error}`,
                new Error(error)
            );
        }

        throw error;
    }
}
