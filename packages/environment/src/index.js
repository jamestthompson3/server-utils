/**
 *
 * This is so we don't read from process.env multiple times as this can be slow.
 */
export class Environment {
  #environment = {};
  /**
   * @param {object} config - an object with keys as environment variables and values as either a string or a function that takes the environment and returns the value
   */
  constructor(config) {
    const { env } = process;
    Object.entries(config).forEach(([key, value]) => {
      if (typeof value === "function") {
        const val = value(env);
        if (val === undefined || val === null) {
          throw new Error(`Missing environment variable ${key}`);
        }
        this.#environment[key] = val;
      } else if (env[value] === undefined || env[value] === null) {
        throw new Error(`Missing environment variable ${key}`);
      } else {
        this.#environment[key] = env[value];
      }
    });
  }
  /**
   *
   * Utility function to get an environment variable
   * @param {string} key - name of the environment variable you want to get, must be previously defined in config
   *
   * @example
   * const PORT = env.var('PORT')
   *
   */
  var(key) {
    const value = this.#environment[key];
    if (value === undefined || value === null) {
      throw new Error(`Did not find value for ${key}`);
    }
    return value;
  }
}
