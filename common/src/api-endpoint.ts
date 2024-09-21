const ApiEndpoint = {
    pairInitiate: '/pair/initiate',
    pairInfo: '/pair/connection/:connectionId',
    pairAccept: '/pair/connection/:connectionId/accept',
    connectionInfo: '/connection/:connectionId',
    updateConnection: '/connection/:connectionId',
    listSms: '/sms/:connectionId',
    addSms: '/sms/:connectionId',
    unpair: '/unpair/:connectionId'
} as const;

export default ApiEndpoint;