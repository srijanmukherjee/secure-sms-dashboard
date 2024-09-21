import { ApiResponse } from "./api";
import { HttpResponse } from "./api-client";

export class Exception extends Error {
    public message: string;
    public throwable: Error | null;

    constructor(message: string, throwable: Error | null = null) {
        super(message);
        
        this.message = message;
        this.throwable = throwable;
    }
}

export class ApiConnectorException extends Exception {
    public response: HttpResponse<ApiResponse>;

    constructor(response: HttpResponse<ApiResponse>) {
        super(response.body.message, null);
        this.response = response;
    }
}