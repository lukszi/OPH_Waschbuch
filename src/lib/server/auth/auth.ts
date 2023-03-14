import {error, type RequestEvent} from "@sveltejs/kit";
import {createVerify, Verify} from "crypto";
import {readFileSync} from "fs";
import {join} from "path";

/**
 * Get the room number that is authenticated by the given token
 *
 * @param authToken validated authToken
 * @throws 401 error if the room claim is missing
 * @return {string} The room number
 */
export function getAuthenticatedRoom(authToken: string): string {
    const payload = parseTokenPayload(authToken);
    try {
        return <string>payload.room;
    } catch (e) {
        throw error(401, 'Token missing room claim');
    }
}

const publicKey = readFileSync(join('src', 'lib', 'server', 'auth', 'public.pem'));

/**
 * Verifies the signature of the given JWT token
 *
 * @param auth complete Authorization header
 * @throws 401 error if the signature is invalid
 *
 * @return nothing if the signature is valid
 */
function verifySignature(auth: string): void {
    const token: string = auth.split(' ')[1];
    const [jwtHeader, jwtPayload, jwtSignature]: string[] = token.split('.');
    const jwtHeaderDecoded: Record<string, unknown> = JSON.parse(Buffer.from(jwtHeader, 'base64').toString('utf-8'));

    let alg: string = <string>jwtHeaderDecoded.alg;
    if (alg === 'RS256') {
        alg = 'RSA-SHA256';
    } else {
        throw error(401, 'Unsupported Token signature algorithm');
    }

    const verifySignature: Verify = createVerify(alg);
    verifySignature.write(jwtHeader + '.' + jwtPayload);
    verifySignature.end();

    const verified: boolean = verifySignature.verify(publicKey, jwtSignature, 'base64');
    if (!verified) {
        throw error(401, 'Token not signed correctly');
    }
}

/**
 * Checks whether the request has a valid token and returns it, otherwise terminates the request with a 401
 *
 * @throws 401 error if token is missing, invalid, expired or not issued by this server
 * @return {string} A validated token
 */
export function getVerifiedToken(event: RequestEvent): string {
    const auth: string | null = event.request.headers.get('Authorization');
    if (auth === null) {
        throw error(401, 'No authentication token provided');
    }

    // Check if auth is JWT
    const jwtRegex = /^Bearer [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
    if (!jwtRegex.test(auth)) {
        const invalidAuthError = error(401, 'Invalid authentication token provided');
        invalidAuthError.headers = {'WWW-Authenticate': 'Bearer'};
        throw invalidAuthError;
    }

    verifySignature(auth);

    return auth;
}

/**
 * Parses the payload of a JWT token
 *
 * @param auth complete JWT authToken
 */
function parseTokenPayload(auth: string): Record<string, unknown> {
    try {
        const token: string = auth.split(' ')[1];
        const payload: string = token.split('.')[1];
        const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
        return JSON.parse(decodedPayload);
    } catch (e) {
        throw error(401, 'Invalid authentication token provided');
    }
}