export declare const ApiEndpoint: {
    readonly pairInitiate: "/pair/initiate";
    readonly pairInfo: "/pair/connection/:connectionId";
    readonly pairAccept: "/pair/connection/:connectionId/accept";
    readonly connectionInfo: "/connection/:connectionId";
    readonly updateConnection: "/connection/:connectionId";
    readonly listSms: "/sms/:connectionId";
    readonly addSms: "/sms/:connectionId";
    readonly unpair: "/unpair/:connectionId";
};
