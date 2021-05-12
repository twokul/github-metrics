/**
 * The function that runs the following workflow:
 *
 * - Creates both Github and Slack clients
 * - Generates a weekly pull requests report
 * - Posts a message on Slack
 *
 * @public
 */
export declare function run({ githubOwner, githubRepo, githubToken, slackAppToken, slackChannelId, logDebugMessages, }: {
    githubOwner: string;
    githubRepo: string;
    githubToken: string;
    slackAppToken: string;
    slackChannelId: string;
    logDebugMessages: string;
}): Promise<void>;
