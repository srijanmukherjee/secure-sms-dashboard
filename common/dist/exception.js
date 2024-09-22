"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiConnectorException = exports.Exception = void 0;
class Exception extends Error {
    constructor(message, throwable = null) {
        super(message);
        this.message = message;
        this.throwable = throwable;
    }
}
exports.Exception = Exception;
class ApiConnectorException extends Exception {
    constructor(response) {
        super(response.body.message, null);
        this.response = response;
    }
}
exports.ApiConnectorException = ApiConnectorException;
