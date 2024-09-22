"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pairInitiate = pairInitiate;
exports.getPairInfo = getPairInfo;
exports.pairAccept = pairAccept;
exports.getConnectionInfo = getConnectionInfo;
exports.updateConnectionState = updateConnectionState;
exports.listSms = listSms;
exports.addSms = addSms;
exports.unpair = unpair;
const api_1 = require("./api");
const api_endpoint_1 = require("./api-endpoint");
const exception_1 = require("./exception");
function pairInitiate(client, request) {
    return callApi(client.post(api_endpoint_1.ApiEndpoint.pairInitiate, request));
}
function getPairInfo(client, connectionId) {
    return callApi(client.get(api_endpoint_1.ApiEndpoint.pairInfo.replace(':connectionId', connectionId)));
}
function pairAccept(client, connectionId, request) {
    return callApi(client.post(api_endpoint_1.ApiEndpoint.pairAccept.replace(':connectionId', connectionId), request));
}
function getConnectionInfo(client, connectionId) {
    return callApi(client.get(api_endpoint_1.ApiEndpoint.connectionInfo.replace(':connectionId', connectionId)));
}
function updateConnectionState(client, connectionId, request) {
    return callApi(client.post(api_endpoint_1.ApiEndpoint.updateConnection.replace(':connectionId', connectionId), request));
}
function listSms(client, connectionId, params) {
    const queryParams = new URLSearchParams();
    if (params.limit !== undefined)
        queryParams.append('limit', params.limit.toString());
    if (params.after !== undefined)
        queryParams.append('after', params.after.toString());
    if (params.before !== undefined)
        queryParams.append('before', params.before.toString());
    const separator = queryParams.size === 0 ? '' : '?';
    const endpoint = `${api_endpoint_1.ApiEndpoint.listSms.replace(':connectionId', connectionId)}${separator}${queryParams.toString()}`;
    return callApi(client.get(endpoint));
}
function addSms(client, connectionId, request) {
    return callApi(client.post(api_endpoint_1.ApiEndpoint.addSms.replace(':connectionId', connectionId), request), true, api_1.HttpStatusCode.CREATED);
}
function unpair(client, connectionId) {
    return callApi(client.get(api_endpoint_1.ApiEndpoint.unpair.replace(':connectionId', connectionId)));
}
function callApi(apiCall_1) {
    return __awaiter(this, arguments, void 0, function* (apiCall, httpStatusCodeOnly = false, successStatusCode = api_1.HttpStatusCode.OK) {
        try {
            const response = yield apiCall;
            if (httpStatusCodeOnly && response.statusCode === successStatusCode) {
                return response.body.data;
            }
            else if (!httpStatusCodeOnly && response.statusCode === successStatusCode && response.body.statusCode === api_1.ApiStatusCode.OK) {
                return response.body.data;
            }
            throw new exception_1.ApiConnectorException(response);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new exception_1.Exception(`failed to invoke endpoint due to ${error.message}`, error);
            }
            else if (typeof error === 'string') {
                throw new exception_1.Exception(`failed to invoke endpoint due to ${error}`, new Error(error));
            }
            throw error;
        }
    });
}
