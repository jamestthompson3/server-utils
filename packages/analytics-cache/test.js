import assert from "node:assert";
import test, { mock } from "node:test";
import { AnalyticsSession } from "./src/index.js";

const testData = {
  ip: "127.0.0.1",
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  pathPart: "test",
};

const noop = () => {};
mock.timers.enable({ apis: ["setInterval", "Date"] });

test("adding a session should return a session key", () => {
  const session = new AnalyticsSession();
  const cbs = (err, sessionId) => {
    assert.ifError(err);
    assert.ok(sessionId);
    assert.ok(typeof sessionId === "string");
  };
  session.addSession(testData, cbs);
  const cb = (err, exists) => {
    assert.ifError(err);
    assert.ok(exists);
  };
  session.sessionExistsForPath(testData, cb);
});

test("sessionExistsForPath should return false if the path is not in the cache", () => {
  const session = new AnalyticsSession();
  const cb = (err, exists) => {
    assert.ifError(err);
    assert.ok(!exists);
  };
  session.sessionExistsForPath(testData, cb);
});

test("sessionExistsForPath should return false if the path is in the cache but the session is not", () => {
  const session = new AnalyticsSession();
  session.addSession(testData, noop);
  const cb = (err, exists) => {
    assert.ifError(err);
    assert.ok(!exists);
  };
  const data = {
    ip: "192.168.1.1",
    userAgent: testData.userAgent,
    pathPart: testData.pathPart,
  };
  session.sessionExistsForPath(data, cb);
});

test("sessionExistsForPath should return false if the ip is in the cache, but the userAgent is not", () => {
  const session = new AnalyticsSession();
  session.addSession(testData, noop);
  const cb = (err, exists) => {
    assert.ifError(err);
    assert.ok(!exists);
  };
  const data = {
    ip: testData.ip,
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
    pathPart: testData.pathPart,
  };
  session.sessionExistsForPath(data, cb);
});

test("addSession should return an error if required arguments are missing", () => {
  const session = new AnalyticsSession();
  const cb = (err, exists) => {
    assert.ok(err);
    assert.equal(err.message, "pathPart is required");
    assert.equal(exists, undefined);
  };
  session.addSession({ ip: "192.168.1.1", userAgent: testData.userAgent }, cb);
});

test("sessionExistsForPath should return an error if required arguments are missing", () => {
  const session = new AnalyticsSession();
  const cb = (err, exists) => {
    assert.ok(err);
    assert.equal(err.message, "ip is required");
    assert.equal(exists, undefined);
  };
  session.sessionExistsForPath(
    { pathPart: "test", userAgent: testData.userAgent },
    cb,
  );
});

test("delete should delete a session", () => {
  const session = new AnalyticsSession();
  session.addSession(testData, noop);
  const cb = (err, exists) => {
    assert.ifError(err);
    assert.ok(!exists);
  };
  session.delete(testData, cb);
  const cb2 = (err, exists) => {
    assert.ifError(err);
    assert.ok(!exists);
  };
  session.sessionExistsForPath(testData, cb2);
});

test("sessions should be deleted after the specified lifetime", () => {
  const session = new AnalyticsSession({ lifetime: 50 });
  const cbs = (err, sessionId) => {
    assert.ifError(err);
    assert.ok(sessionId);
    assert.ok(typeof sessionId === "string");
  };
  session.addSession(testData, cbs);
  const cb = (err, exists) => {
    assert.ifError(err);
    assert.ok(exists);
  };
  session.sessionExistsForPath(testData, cb);
  mock.timers.tick(100);

  setTimeout(() => {
    const cb2 = (err, exists) => {
      assert.ifError(err);
      assert.ok(!exists);
    };
    session.sessionExistsForPath(testData, cb2);
    session.cleanup();
  }, 200);
});

test("Asynchronous methods should return a promise", async () => {
  const session = new AnalyticsSession({ async: true });
  const [err, sessionId] = await session.addSession(testData);
  assert.ifError(err);
  assert.ok(sessionId);
  assert.ok(typeof sessionId === "string");
  const [eErr, exists] = await session.sessionExistsForPath(testData);
  assert.ifError(eErr);
  assert.ok(exists);
});
