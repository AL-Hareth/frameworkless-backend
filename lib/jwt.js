const { createHmac } = await import("node:crypto");
import { Buffer } from "node:buffer";

const header = {
    alg: "HS256",
    typ: "JWT",
};

/**
* Takes a payload and returns a JWT
*/
export function generateToken(payload) {
    const headerBuffer = Buffer.from(JSON.stringify(header), 'utf8');
    const payloadBuffer = Buffer.from(JSON.stringify(payload), 'utf8');
    const base64Header = headerBuffer.toString('base64url');
    const base64Payload = payloadBuffer.toString('base64url');

    const signedJWT = sign(`${base64Header}.${base64Payload}`);
    return `${base64Header}.${base64Payload}.${signedJWT}`;
}

function sign(data) { // data is `header.payload` and returns a signature
    const hashed = createHmac('sha256', process.env.SECRET);
    hashed.update(data);

    return hashed.digest('base64url');
}

/**
 * Verifies that a given JWT is valid
*/
export function verify(jwt) {
    const [header, payload, signature] = jwt.split('.');

    if (!signature) { // This is an unsigned JWT
        return false;
    }

    if (sign(`${header}.${payload}`) === signature) {
        return true;
    }

    return false;
}

/**
 * Extracts the payload from the JWT
 */
export function decode(jwt) {
    const [_, payload] = jwt.split('.');
    const decodedPayload = atob(payload);

    return JSON.parse(decodedPayload);
}

