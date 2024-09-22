"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiEndpoint = void 0;
exports.ApiEndpoint = {
    pairInitiate: '/pair/initiate',
    pairInfo: '/pair/connection/:connectionId',
    pairAccept: '/pair/connection/:connectionId/accept',
    connectionInfo: '/connection/:connectionId',
    updateConnection: '/connection/:connectionId',
    listSms: '/sms/:connectionId',
    addSms: '/sms/:connectionId',
    unpair: '/unpair/:connectionId'
};
