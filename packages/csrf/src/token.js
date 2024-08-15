import { createHmac, randomBytes } from "node:crypto";

export const tokenLength = 32;

/**
 * Generates a new token
 * The returned token is a combination of the hashed token signed by the secret and a raw token of the same length.
 * The raw token is used in the cookie and the hashed token is used in the response context.
 * The tokens should be considered as a 32 and 64 byte slice.
 * signedTokenrawToken
 * ^----------^------^
 *   32 bytes   32 bytes
 * @param {string} secret - The secret used to generate the CSRF token, must be exactly 32 characters
 * @returns {string} The generated token
 */
export function generateTokenBuf(secret) {
  // Allocate a buffer twice the size of the token which will store the hashed token and the raw token.
  const buff = Buffer.alloc(tokenLength * 2);
  // Create an HMAC with the secret and random bytes equal to the token length.
  const hmac = createHmac("sha256", secret);
  const token = randomBytes(tokenLength);
  hmac.update(token);
  const realToken = hmac.digest();
  // Copy the hashed token to the buffer.
  realToken.copy(buff, 0);
  // Copy the raw token into the buffer
  token.copy(buff, tokenLength);
  return buff;
}

/**
 *
 * Crates a full token buffer (raw + signed) from a raw token and a secret.
 * @param {Buffer} rawToken - The raw token
 * @param {string} secret - The secret used to generate the token
 * @returns {Buffer} The full token buffer
 */
export function tokenBufFromRaw(rawToken, secret) {
  const buff = Buffer.alloc(tokenLength * 2);
  const hmac = createHmac("sha256", secret);
  hmac.update(rawToken);
  const realToken = hmac.digest();
  realToken.copy(buff, 0);
  rawToken.copy(buff, tokenLength);
  return buff;
}

/**
 *
 * Validates that this token could have been produced by the given secret.
 * @param {Buffer} data - The token data to verify
 * @param {string} secret - The secret used to generate the token
 * @throws {Error} If the token could not be verified
 */
export function verifyToken(data, secret) {
  if (data.length !== tokenLength * 2) {
    throw new Error("Data must be twice the token length");
  }
  const signedToken = data.subarray(0, tokenLength);
  const rawToken = data.subarray(tokenLength);
  const hmac = createHmac("sha256", secret);
  hmac.update(rawToken);
  const calculatedToken = hmac.digest();
  if (Buffer.compare(calculatedToken, signedToken) !== 0) {
    throw new Error("Tokens do not match");
  }
}
