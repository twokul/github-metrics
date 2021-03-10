import * as core from "@actions/core";
import GithubMetrics from "./github-metrics";
import { WebClient } from "@slack/web-api";
import { constructDailyGithubMetricsSlackMessage } from "./format-utils";

async function run({
  githubOwner,
  githubRepo,
  githubToken,
  slackAppToken,
  slackChannelId,
}: {
  githubOwner: string;
  githubRepo: string;
  githubToken: string;
  slackAppToken: string;
  slackChannelId: string;
}): Promise<void> {
  try {
    const slack = new WebClient(slackAppToken);
    const githubMetrics = new GithubMetrics({
      token: githubToken,
    });
    const dailyReport = await githubMetrics.generateDailyReport({
      owner: githubOwner,
      repo: githubRepo,
    });

    const message = constructDailyGithubMetricsSlackMessage({
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

    core.debug(
      `Successfully send message ${result.ts} in conversation ${slackChannelId}`
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

const githubOwner = process.env.GITHUB_OWNER || core.getInput("github-owner");
const githubRepo = process.env.GITHUB_REPO || core.getInput("github-repo");
const githubToken = process.env.GITHUB_TOKEN || core.getInput("github-token");
const slackChannelId =
  process.env.SLACK_CHANNEL_ID || core.getInput("slack-channel-id");
const slackAppToken =
  process.env.SLACK_APP_TOKEN || core.getInput("slack-app-token");

run({
  githubOwner,
  githubRepo,
  githubToken,
  slackAppToken,
  slackChannelId,
});
