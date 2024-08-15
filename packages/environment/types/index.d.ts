/**
 *
 * This is so we don't read from process.env multiple times as this can be slow.
 */
export class Environment {
    /**
     * @param {object} config - an object with keys as environment variables and values as either a string or a function that takes the environment and returns the value
     */
    constructor(config: object);
    /**
     *
     * Utility function to get an environment variable
     * @param {string} key - name of the environment variable you want to get, must be previously defined in config
     *
     * @example
     * const PORT = env.var('PORT')
     *
     */
    var(key: string): any;
    #private;
}
//# sourceMappingURL=index.d.ts.map