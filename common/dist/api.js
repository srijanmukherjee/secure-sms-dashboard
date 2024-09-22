"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentConnectionState = exports.HttpStatusCode = exports.ApiStatusCode = void 0;
var ApiStatusCode;
(function (ApiStatusCode) {
    ApiStatusCode["OK"] = "OK";
    ApiStatusCode["BAD_REQUEST"] = "BAD_REQUEST";
    ApiStatusCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ApiStatusCode["NOT_FOUND"] = "NOT_FOUND";
    ApiStatusCode["PAIRING_REQUEST_EXPIRED"] = "PAIRING_REQUEST_EXPIRED";
})(ApiStatusCode || (exports.ApiStatusCode = ApiStatusCode = {}));
var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["OK"] = 200] = "OK";
    HttpStatusCode[HttpStatusCode["CREATED"] = 201] = "CREATED";
})(HttpStatusCode || (exports.HttpStatusCode = HttpStatusCode = {}));
var AgentConnectionState;
(function (AgentConnectionState) {
    AgentConnectionState["SERVICE_ACTIVE"] = "SERVICE_ACTIVE";
    AgentConnectionState["SERVICE_INACTIVE"] = "SERVICE_INACTIVE";
})(AgentConnectionState || (exports.AgentConnectionState = AgentConnectionState = {}));
