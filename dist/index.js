"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github_metrics_1 = require("./github-metrics");
const web_api_1 = require("@slack/web-api");
const format_utils_1 = require("./format-utils");
async function run({ githubOwner, githubRepo, githubToken, slackAppToken, slackChannelId, }) {
    try {
        const slack = new web_api_1.WebClient(slackAppToken);
        const githubMetrics = new github_metrics_1.default({
            token: githubToken,
        });
        const dailyReport = await githubMetrics.generateDailyReport({
            owner: githubOwner,
            repo: githubRepo,
        });
        const message = format_utils_1.constructDailyGithubMetricsSlackMessage({
            text: "Hello world!",
            channel: slackChannelId,
            content: {
                repoName: dailyReport.name,
                openPullRequests: dailyReport.openedPullRequests.length,
                closedPullRequests: dailyReport.closedPullRequests.length,
                mergedPullRequests: dailyReport.mergedPullRequests.length,
                averageIdleTime: Number(dailyReport.averageIdleTime.toFixed(1)),
                averageTimeToMerge: Number(dailyReport.averageTimeToMerge.toFixed(1)),
                aggregatedReviewDepth: dailyReport.aggregatedReviewDepth,
                hotfixes: dailyReport.hotfixes,
            },
        });
        const result = await slack.chat.postMessage(message);
        core.debug(`Successfully send message ${result.ts} in conversation ${slackChannelId}`);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
const githubOwner = process.env.GITHUB_OWNER || core.getInput("github-owner");
const githubRepo = process.env.GITHUB_REPO || core.getInput("github-repo");
const githubToken = process.env.GITHUB_TOKEN || core.getInput("github-token");
const slackChannelId = process.env.SLACK_CHANNEL_ID || core.getInput("slack-channel-id");
const slackAppToken = process.env.SLACK_APP_TOKEN || core.getInput("slack-app-token");
run({
    githubOwner,
    githubRepo,
    githubToken,
    slackAppToken,
    slackChannelId,
});
