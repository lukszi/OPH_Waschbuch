/**
 * Functions concerned with handling errors arising from the api
 */

import {AuthenticationError, AuthorizationError, NetworkError, RequestError, ServerError} from "../errors";

/**
 * Execute a fetch request with the passed along options
 *
 * @param input @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters
 * @param init @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters
 *
 * @throws Corresponding errors if the request failed
 *
 * @return {Promise<Response>} Response of successful request
 */
export async function fetchAndHandleError(input: string, init: RequestInit | undefined): Promise<Response> {
    let response: Response
    try {
        response = await fetch(input, init);
    } catch (e) {
        throw e instanceof TypeError ? new NetworkError("Could not connect to server: " + e.message) : e;
    }

    if (!response.ok) {
        handleFailedRequest(response);
    }
    return response;
}

/**
 * Construct and throw corresponding errors for failed requests
 *
 * @throws RequestError if response status is 400, 409
 * @throws AuthorizationError if response status is 401
 * @throws AuthenticationError if response status is 403
 * @throws ServerError if response status is 5XX
 * @throws Error if response status is not expected
 *
 * @param response
 */
export function handleFailedRequest(response: Response) {
    if (response.status === 401) {
        throw new AuthenticationError(response.statusText);
    }
    if (response.status === 400) {
        throw new RequestError(response.statusText, response.status);
    }
    if (response.status === 403) {
        throw new AuthorizationError(response.statusText);
    }
    if (response.status === 409) {
        throw new RequestError(response.statusText, response.status);
    }
    if (response.status >= 500 && response.status < 600) {
        throw new ServerError(response.statusText, response.status);
    }
    throw new Error("Unknown network request error: " + response.statusText);
}