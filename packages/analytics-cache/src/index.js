import { createHash, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { ulid } from "ulid";
import { hoursToMs } from "./time.js";

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
  has(requestHash, path, cb) {}
  /**
   * @param {string} requestHash
   * @param {string} path
   * @param {(err: Error, sessionId: string) => void} cb
   */
  set(requestHash, path, cb) {}
  /**
   * @param {string} requestHash
   * @param {(err: Error) => void} cb
   */
  delete(requestHash, cb) {}
  /**
   * @param {(err: Error, sessions: Array<[string, Session]>) => void} cb
   */
  all(cb) {}
}

class InMemoryCache extends Cache {
  constructor() {
    super();
    this.sessions = new Map();
    this.seenPaths = new Map();
  }
  /**
   * @param {string} requestHash
   * @param {string} path
   * @param {(err: Error, exists: boolean) => void} cb
   */
  has(requestHash, path, cb) {
    const sessionKey = this.sessions.get(requestHash)?.id;
    if (!sessionKey) return cb(undefined, false);
    return cb(undefined, this.seenPaths.get(sessionKey).has(path));
  }
  /**
   * @param {string} requestHash
   * @param {string} path
   * @param {(err: Error, sessionId: string) => void} cb
   */
  set(requestHash, path, cb) {
    let sessionId = this.sessions.get(requestHash)?.id;
    if (!sessionId) {
      sessionId = ulid();
      this.sessions.set(requestHash, {
        timestamp: new Date(),
        id: sessionId,
      });
      this.seenPaths.set(sessionId, new Set());
    }
    this.seenPaths.get(sessionId).add(path);
    return cb(undefined, sessionId);
  }
  /**
   * @param {string} requestHash
   * @param {(err: Error) => void} cb
   */
  delete(requestHash, cb) {
    const sessionKey = this.sessions.get(requestHash)?.id;
    if (!sessionKey) return cb(undefined, undefined);
    this.seenPaths.delete(sessionKey);
    this.sessions.delete(requestHash);
    return cb(undefined, undefined);
  }
  /**
   * @param {(err: Error, sessions: Array<[string, Session]>) => void} cb
   */
  all(cb) {
    return cb(undefined, Array.from(this.sessions));
  }
}

export class AnalyticsSession {
  #sweepInterval;
  /** @param {SessionOptions} opts */
  constructor(opts = {}) {
    this.hasher =
      opts.hasher || (() => createHash("md5", opts.secret || randomBytes(16)));
    this.cache = opts.cache ? new opts.cache() : new InMemoryCache();
    this.lifetime = opts.lifetime || hoursToMs(8);
    this.#sweepInterval = setInterval(
      () => this.#scheduleSweep(),
      this.lifetime,
    );
    this.async = opts.async || false;
  }

  /**
   * @param {CacheObject} props
   * @param {(err: Error, sessionId: string) => void} cb
   */
  addSession(props, cb) {
    const propError = this.#checkPropErrors(props, cb);
    if (propError) {
      return cb(propError, undefined);
    }
    const hash = this.hasher();
    hash.update(props.ip);
    hash.update(props.userAgent);
    const requestHash = hash.digest("hex");
    if (this.async) {
      const asyncSet = promisify(this.cache.set).bind(this.cache);
      return asyncSet(requestHash, props.pathPart)
        .then((sessionId) => {
          return [undefined, sessionId];
        })
        .catch((err) => {
          return [err, undefined];
        });
    }
    this.cache.set(requestHash, props.pathPart, cb);
  }

  /**
   * @param {CacheObject} props
   * @param {(err: Error, exists: boolean) => void} cb
   */
  sessionExistsForPath(props, cb) {
    const propError = this.#checkPropErrors(props);
    if (propError) {
      return cb(propError, undefined);
    }
    const hash = this.hasher();
    hash.update(props.ip);
    hash.update(props.userAgent);
    const requestHash = hash.digest("hex");
    if (this.async) {
      const asyncHas = promisify(this.cache.has).bind(this.cache);
      return asyncHas(requestHash, props.pathPart)
        .then((exists) => {
          return [undefined, exists];
        })
        .catch((err) => {
          return [err, undefined];
        });
    }
    this.cache.has(requestHash, props.pathPart, cb);
  }

  /**
   * @param {CacheObject} props
   * @param {(err: Error) => void} cb
   */
  delete(props, cb) {
    const propError = this.#checkPropErrors(props);
    if (propError) {
      return cb(propError, undefined);
    }
    const hash = this.hasher();
    hash.update(props.ip);
    hash.update(props.userAgent);
    const requestHash = hash.digest("hex");
    if (this.async) {
      const asyncDelete = promisify(this.cache.delete).bind(this.cache);
      return asyncDelete(requestHash)
        .then(() => {
          return [undefined, undefined];
        })
        .catch((err) => {
          return [err, undefined];
        });
    }
    this.cache.delete(requestHash, cb);
  }

  #checkPropErrors(props) {
    if (!props.ip) return new Error("ip is required");
    if (!props.userAgent) return new Error("userAgent is required");
    if (!props.pathPart) return new Error("pathPart is required");

    return undefined;
  }

  #scheduleSweep() {
    const now = new Date();
    this.cache.all((err, sessions) => {
      if (err) throw err;
      process.nextTick(() =>
        sessions.forEach(([key, session]) => {
          if (now - session.timestamp > this.lifetime) {
            this.cache.delete(key, () => {});
          }
        }),
      );
    });
  }

  cleanup() {
    this.#sweepInterval = clearInterval(this.#sweepInterval);
    this.cache.all((err, sessions) => {
      if (err) throw err;
      process.nextTick(() => {
        sessions.forEach(([key]) => {
          this.cache.delete(key, () => {});
        });
      });
    });
  }
}
