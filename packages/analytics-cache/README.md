# Analytics Cache

This is a simple cache for tracking page views and other analytic events. It produces a short-lived anonymized ID that can be used to track session events for a user without exposing PII.

## Usage

```js
import { AnalyticsSession } from '@slowerloris/analytics-cache';

const cache = new AnalyticsSession();

// Add a session for a particular path:

app.get('/post/:id', (req, res) => {
const requestData = {ip: req.ips.join(""), pathPart: req.originalUrl, req.get("user-agent")};
    cache.sessionExistsForPath(requestData, (err, exists) => {
       if (!exists) {
        cache.addSession(requestData, async (err, sessionId) => {
           if (err) {
             console.error(err);
           } else {
             await db.insertAnalyticEvent("PAGE_VIEW", req.originalUrl);
             // render the post
             // set the sessionId as a cookie,
             // etc.
           }
        });
       }
    });
});


// Or, using the async API:

app.get('/post/:id', async (req, res) => {
    const requestData = {ip: req.ips.join(""), pathPart: req.originalUrl, req.get("user-agent")};
    const [err, exists] = await cache.sessionExistsForPath(requestData);
    if (!err) {
        const [sessionErr, sessionId] = await cache.addSession(requestData);
        if (sessionErr) {
            console.error(sessionErr);
        } else {
        await db.insertAnalyticEvent("PAGE_VIEW", req.originalUrl);
        // render the post
        // set the sessionId as a cookie,
        // etc.
        }
    } else {
        console.error(err);
    }
});
```

## Configuration

The cache can be configured with the following options:

| Option | Description | Default |
| --- | --- | --- |
| `cache` | The cache implementation to use | `InMemoryCache` |
| `async` | Whether to return a promise rather than using callbacks | `false` |
| `hasher` | A hash function to use for hashing incoming requests | `crypto.createHash('md5', opts.secret)` |
| `secret` | A secret key to use for generating keys | `crypto.randomBytes(16)` |
| `lifetime` | The number of milliseconds after which a session is considered expired | `28800000` (8 hours) |


## Implementing a custom cache

The cache can be implemented by extending the `Cache` class and overriding the following methods:

| Method | Description |
| --- | --- |
| `has(requestHash, path, cb)` | Checks if a session exists for a given request hash and path. |
| `set(requestHash, path, cb)` | Sets a session for a given request hash and path. |
| `delete(requestHash, cb)` | Deletes a session for a given request hash. |
| `all(cb)` | returns all sessions as an array of `[key, session]` pairs. |

### NOTE!

Sessions should be stored in the following format:

```js
{
    id: string,
    timestamp: Date
}
```

Sessions ids _should not_ contain the hashed request data, and should be generated uniquely for each request. This is to ensure that the sessionId itself does not contain any PII and that there is no process by which one can ascertain any PII from the sessionId on its own.

