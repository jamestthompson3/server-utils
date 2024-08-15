import assert from "node:assert";
import test from "node:test";
import {
  generateTokenBuf,
  tokenBufFromRaw,
  verifyToken,
  tokenLength,
} from "./token.js";

test("generateToken should generate a token of 128 characters", () => {
  const secret = "secret";
  const token = generateTokenBuf(secret);
  // We expect the stringified final result to be 4x the token length because we have both the hashed token and the raw token and hex uses 2 characters per byte.
  assert.equal(token.toString("hex").length, tokenLength * 4);
});

test("verifyToken should verify a token", () => {
  const secret = "secret";
  const token = generateTokenBuf(secret);
  assert.doesNotThrow(() => {
    verifyToken(token, secret);
  });
});

test("verifyToken should not verify a token with a different secret", () => {
  const secret = "secret";
  const token = generateTokenBuf(secret);
  assert.throws(() => {
    verifyToken(token, "different-secret");
  });
});

test("verifyToken should not verify a token with a different length", () => {
  const secret = "secret";
  const token = generateTokenBuf(secret);
  assert.throws(() => {
    verifyToken(token.subarray(0, tokenLength - 1), secret);
  });
});

test("tokenBufFromRaw should create a full token buffer from a raw token", () => {
  const secret = "secret";
  const token = generateTokenBuf(secret);
  const rawToken = token.subarray(tokenLength);
  const fullToken = tokenBufFromRaw(rawToken, secret);
  assert.equal(fullToken.toString("hex"), token.toString("hex"));
});

test("tokenBufFromRaw should not create a full token buffer from a raw token with a different secret", () => {
  const secret = "secret";
  const token = generateTokenBuf(secret);
  const rawToken = token.subarray(tokenLength);
  const fullToken = tokenBufFromRaw(rawToken, "different-secret");
  assert.notEqual(fullToken.toString("hex"), token.toString("hex"));
});
