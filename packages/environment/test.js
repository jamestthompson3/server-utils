import assert from "node:assert";
import test from "node:test";
import { Environment } from "./src/index.js";

test("Environment should throw if a required environment variable is missing", () => {
  const config = {
    PORT: "PORT",
  };
  assert.throws(() => new Environment(config), {
    message: "Missing environment variable PORT",
  });
});

test("Environment should not throw if all required environment variables are present", () => {
  process.env.PORT = "1234";
  const config = {
    PORT: "PORT",
  };
  assert.doesNotThrow(() => new Environment(config));
});

test("Environment should accept functions as config options", () => {
  process.env.DEBUG = "myapp:express-sesssion:cookiebanner";
  const config = {
    DEBUG: (env) => env.DEBUG.split(":").includes("myapp"),
  };
  let env;
  assert.doesNotThrow(() => {
    env = new Environment(config);
  });
  assert.equal(env.var("DEBUG"), true);
});

test("Environment should not throw if environment variable is false", () => {
  process.env.DEBUG = "express";
  const config = {
    PORT: "PORT",
    DEBUG: (env) => env.DEBUG.includes("myapp"),
  };
  let env;
  assert.doesNotThrow(() => {
    env = new Environment(config);
  });
  assert.equal(env.var("DEBUG"), false);
});

test("env.var() should return the value of the environment variable if present", () => {
  process.env.PORT = "1234";
  const config = {
    PORT: "PORT",
  };
  const env = new Environment(config);
  assert.equal(env.var("PORT"), "1234");
});

test("env.var() should throw if the variable is not present", () => {
  process.env.PORT = "1234";
  const config = {
    PORT: "PORT",
  };
  const env = new Environment(config);
  assert.throws(() => env.var("NOT_PRESENT"), {
    message: "Did not find value for NOT_PRESENT",
  });
});
