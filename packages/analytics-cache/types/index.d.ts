/**
 * @typedef {Object} Session - A session object.
 * @property {string} id - The session ID - randomly generated _WITHOUT USING THE HASHED REQUEST_.
 * @property {Date} timestamp - The timestamp of the session.
 *
 */
/**
 * @typedef {Record<string, Session} SessionMap - A map of session keys to session objects.
 * @property {Session} Session - A session object.
 *
 */
/**
 * @typedef {Object} SessionOptions - Options for the AnalyticsSession class.
 * @property {Hasher} [hasher] - A hash function to use for hashing incoming requests. Defaults to `crypto.createHash('md5', opts.secret)`.
 * @property {boolean} [async] - Whether to return a promise rather than using callbacks. Defaults to `false`.
 * @property {string} [secret] - A secret key to use for generating keys. Defaults to crypto.randomBytes(16).
 * @property {Cache} [cache] - A cache class to use for storing session data. Defaults to `InMemoryCache`.
 * @property {number} [lifetime] - The lifetime of a session in milliseconds. Defaults to 8 hours.
 *
 */
/**
 * @typedef {Object} CacheObject - Object used to construct a cache entry.
 * @property {string} ip - An IP address or joined array of IP addresses.
 * @property {string} userAgent - The user agent string.
 * @property {string} pathPart - The part of the path that determines if the visited path is unique
 */
/**
 * @typedef {Class} Cache - A cache class to use for storing session data.
 * @property {function} get - Gets a session from the cache.
 * @property {function} set - Sets a session in the cache.
 * @property {function} delete - Deletes a session from the cache.
 * @property {function} all - Gets all sessions from the cache.
 *
 */
export class Cache {
    /**
     * @param {string} requestHash
     * @param {string} path
     * @param {(err: Error, exists: boolean) => void} cb
     */
    has(requestHash: string, path: string, cb: (err: Error, exists: boolean) => void): void;
    /**
     * @param {string} requestHash
     * @param {string} path
     * @param {(err: Error, sessionId: string) => void} cb
     */
    set(requestHash: string, path: string, cb: (err: Error, sessionId: string) => void): void;
    /**
     * @param {string} requestHash
     * @param {(err: Error) => void} cb
     */
    delete(requestHash: string, cb: (err: Error) => void): void;
    /**
     * @param {(err: Error, sessions: Array<[string, Session]>) => void} cb
     */
    all(cb: (err: Error, sessions: Array<[string, Session]>) => void): void;
}
export class AnalyticsSession {
    /** @param {SessionOptions} opts */
    constructor(opts?: SessionOptions);
    hasher: any;
    cache: any;
    lifetime: number;
    async: boolean;
    /**
     * @param {CacheObject} props
     * @param {(err: Error, sessionId: string) => void} cb
     */
    addSession(props: CacheObject, cb: (err: Error, sessionId: string) => void): any;
    /**
     * @param {CacheObject} props
     * @param {(err: Error, exists: boolean) => void} cb
     */
    sessionExistsForPath(props: CacheObject, cb: (err: Error, exists: boolean) => void): any;
    /**
     * @param {CacheObject} props
     * @param {(err: Error) => void} cb
     */
    delete(props: CacheObject, cb: (err: Error) => void): any;
    cleanup(): void;
    #private;
}
/**
 * - A session object.
 */
export type Session = {
    /**
     * - The session ID - randomly generated _WITHOUT USING THE HASHED REQUEST_.
     */
    id: string;
    /**
     * - The timestamp of the session.
     */
    timestamp: Date;
};
/**
 * - A map of session keys to session objects.
 */
export type SessionMap = Record<string, Session>;
/**
 * - Options for the AnalyticsSession class.
 */
export type SessionOptions = {
    /**
     * - A hash function to use for hashing incoming requests. Defaults to `crypto.createHash('md5', opts.secret)`.
     */
    hasher?: Hasher;
    /**
     * - Whether to return a promise rather than using callbacks. Defaults to `false`.
     */
    async?: boolean;
    /**
     * - A secret key to use for generating keys. Defaults to crypto.randomBytes(16).
     */
    secret?: string;
    /**
     * - A cache class to use for storing session data. Defaults to `InMemoryCache`.
     */
    cache?: Cache;
    /**
     * - The lifetime of a session in milliseconds. Defaults to 8 hours.
     */
    lifetime?: number;
};
/**
 * - Object used to construct a cache entry.
 */
export type CacheObject = {
    /**
     * - An IP address or joined array of IP addresses.
     */
    ip: string;
    /**
     * - The user agent string.
     */
    userAgent: string;
    /**
     * - The part of the path that determines if the visited path is unique
     */
    pathPart: string;
};
//# sourceMappingURL=index.d.ts.map