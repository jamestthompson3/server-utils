/**
 * Creates a middleware function that checks for CSRF protection.
 *
 * If this middleware returns an error in the callback, the cookie will be reset.
 *
 * @param {object} config - The configuration object
 * @param {string} config.secret - The secret used to generate the CSRF token, must be exactly 32 characters
 * @param {string[]} config.checkedMethods - The HTTP methods that are checked for CSRF protection, defaults to ["POST", "PUT", "DELETE"]
 * @param {RegExp|string[]} config.excludedPaths - The paths that are exempt from CSRF protection
 * @param {number} config.maxAge - The maximum age of the CSRF token in seconds, defaults to 2592000 (30 days)
 * @param {(error: Error, token: string) => void} callback - The callback function to handle errors or return the token
 * @returns {function} The middleware function
 */
export function csrf(config: {
    secret: string;
    checkedMethods: string[];
    excludedPaths: RegExp | string[];
    maxAge: number;
}, callback: (error: Error, token: string) => void): Function;
//# sourceMappingURL=index.d.ts.map