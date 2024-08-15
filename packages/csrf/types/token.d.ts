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
export function generateTokenBuf(secret: string): string;
/**
 *
 * Crates a full token buffer (raw + signed) from a raw token and a secret.
 * @param {Buffer} rawToken - The raw token
 * @param {string} secret - The secret used to generate the token
 * @returns {Buffer} The full token buffer
 */
export function tokenBufFromRaw(rawToken: Buffer, secret: string): Buffer;
/**
 *
 * Validates that this token could have been produced by the given secret.
 * @param {Buffer} data - The token data to verify
 * @param {string} secret - The secret used to generate the token
 * @throws {Error} If the token could not be verified
 */
export function verifyToken(data: Buffer, secret: string): void;
export const tokenLength: 32;
//# sourceMappingURL=token.d.ts.map