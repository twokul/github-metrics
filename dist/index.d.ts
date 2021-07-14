/**
 * Loads the configuration and generates an overall report
 * based on the metric(s) requested in the configuration.
 *
 * Posts to slack if the `postToSlack` config option is true.
 *
 * @public
 */
export declare function run(): Promise<void>;
