/**
 * Authentication related errors, e.g. unauthenticated requests, requests with invalid tokens etc.
 */
export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthenticationError";
    }
}

/**
 * User tried to do something he wasn't allowed to do
 */
export class AuthorizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthorizationError";
    }
}

/**
 * Request contained invalid data or was malformed
 */
export class RequestError extends Error {
    public status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = "RequestError";
    }
}

/**
 * Issues while communicating with the server
 */
export class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NetworkError";
    }
}

/**
 * Something went wrong within the server
 */
export class ServerError extends Error {
    public status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = "ServerError";
    }
}