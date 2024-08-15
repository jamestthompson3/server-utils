import {
  generateTokenBuf,
  tokenBufFromRaw,
  tokenLength,
  verifyToken,
} from "./token.js";

const defaultConfig = {
  checkedMethods: ["POST", "PUT", "DELETE"],
  excludedPaths: [],
  maxAge: 2592000, // 30 days
};
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
export function csrf(config, callback) {
  const { secret, checkedMethods, excludedPaths, maxAge } = Object.assign(
    defaultConfig,
    config,
  );
  if (!secret || secret.length < tokenLength) {
    return callback(
      new Error("CSRF secret must be provided AND exactly 32 characters"),
    );
  }
  return (req, res) => {
    // Construct a map of cookies
    const cookies = req.headers.cookie
      ? req.headers.cookie.split("; ").reduce((map, curr) => {
          const [key, value] = curr.split("=");
          map[key] = value;
          return map;
        }, {})
      : {};
    let csrfToken = cookies["csrf-token"];
    // No token, generate one
    if (!csrfToken) {
      csrfToken = generateTokenBuf(secret);
      const rawToken = csrfToken.subarray(tokenLength).toString("hex");
      res.setHeader(
        "Set-Cookie",
        `csrf-token=${rawToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Domain=${req.headers.host.split(":")[0]}; Path=/;`,
      );
    } else {
      csrfToken = tokenBufFromRaw(Buffer.from(csrfToken, "hex"), secret);
    }
    // If we aren't checking this method, we're done!
    if (!checkedMethods.includes(req.method)) {
      return callback(undefined, csrfToken.toString("hex"));
    }
    // If the request is exempted, we're done!
    if (
      excludedPaths.some((x) => x === req.url || (x.test && x.test(req.url)))
    ) {
      return callback(undefined, csrfToken.toString("hex"));
    }
    // If the request is being made with https, double check the origin of the referrer
    if (req.protocol === "https:") {
      const referrer = req.headers.referer;
      if (!referrer) {
        return callback(new Error("Referer header is missing"));
      }
      const origin = new URL(referrer).origin;
      const requestUrl = new URL(req.url);
      if (origin.hostName !== requestUrl.hostname) {
        return callback(new Error("Invalid referer header"));
      }
    }
    // Get the token from the request in order of preference:
    // 1. The token in the request header
    // 2. The token in the request body
    const headerToken = req.headers["x-csrf-token"];
    if (headerToken) {
      const token = Buffer.from(headerToken, "hex");
      return verifyRequest(token, csrfToken, secret, res, callback);
    } else if (req.body) {
      if (!req.body._csrf) {
        return callback(
          new Error(
            "No CSRF token found. Add the _csrf property to your request body, or add the x-csrf-token header",
          ),
        );
      }
      const token = Buffer.from(req.body._csrf, "hex");
      return verifyRequest(token, csrfToken, secret, res, callback);
    } else {
      // If we consume the body stream, frameworks will throw an error, so let your framework handle it
      callback(
        new Error("You must register CSRF after a body parsing middleware"),
      );
    }
  };
}

function verifyRequest(token, csrfToken, secret, res, callback) {
  try {
    // Verify that we could have generated this token from our secret
    verifyToken(token, secret);
    // Verify that the tokens actually match
    if (Buffer.compare(token, csrfToken) !== 0) {
      // reset the cookie
      res.setHeader("Set-Cookie", `csrf-token=; Path=/; Max-Age=0`);
      return callback(
        new Error(
          `Tokens do not match got: ${token.toString("hex")} expected: ${csrfToken.toString("hex")}`,
        ),
      );
    }
    callback(undefined, undefined);
  } catch (e) {
    // reset the cookie
    res.setHeader("Set-Cookie", `csrf-token=; Path=/; Max-Age=0`);
    return callback(e);
  }
}
