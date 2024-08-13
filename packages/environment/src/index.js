/**
 *
 * This is so we don't read from process.env multiple times as this can be slow.
 */
export class Environment {
  #environment = {};
  constructor(config) {
    const { env } = process;
    Object.entries(config).forEach(([key, value]) => {
      this.#environment[key] = env[value];
    });
    // FAIL EARLY!
    Object.keys(this.#environment).forEach((key) => {
      if (!this.#environment[key]) {
        throw new Error(`Missing environment variable ${key}`);
      }
    });
  }
  /**
   *
   * Utility function to get an environment variable
   * @param {string} key - name of the environment variable you want to get, must be previously defined in config
   *
   * @example
   * const PORT = env`PORT`
   *
   */
  var(key) {
    const value = this.#environment[key];
    if (!value) {
      throw new Error(`Did not find value for ${key}`);
    }
    return value;
  }
}
