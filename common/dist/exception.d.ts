import { ApiResponse } from "./api";
import { HttpResponse } from "./api-client";
export declare class Exception extends Error {
    message: string;
    throwable: Error | null;
    constructor(message: string, throwable?: Error | null);
}
export declare class ApiConnectorException extends Exception {
    response: HttpResponse<ApiResponse>;
    constructor(response: HttpResponse<ApiResponse>);
}
