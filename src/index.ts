import * as core from '@actions/core';
import GithubMetrics from './github-metrics';
import { WebClient } from '@slack/web-api';
import { constructDailyGithubMetricsSlackMessage } from './format-utils';

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
    const githubMetrics = new GithubMetrics({ token: githubToken });
    const dailyReport = await githubMetrics.generateDailyReport({
      owner: githubOwner,
      repo: githubRepo,
    });

    const message = constructDailyGithubMetricsSlackMessage({
      text: 'Hello world!',
      channel: slackChannelId,
      content: {
        repoName: dailyReport.name,
        openPullRequests: dailyReport.openPullRequests,
        closedPullRequests: dailyReport.closedPullRequests,
        mergedPullRequests: dailyReport.mergedPullRequests,
        averageIdleTime: dailyReport.averageIdleTime,
        averageTimeToMerge: dailyReport.averageTimeToMerge,
        aggregatedReviewDepth: dailyReport.aggregatedReviewDepth,
        hotfixes: dailyReport.hotfixes,
      },
    })
    const result = await slack.chat.postMessage(message);

    core.debug(
      `Successfully send message ${result.ts} in conversation ${slackChannelId}`
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

const githubOwner = core.getInput('github-owner');
const githubRepo = core.getInput('github-repo');
const githubToken = core.getInput('github-token');
const slackChannelId = process.env.SLACK_CHANNEL_ID || core.getInput('slack-channel-id');
const slackAppToken =
  process.env.SLACK_APP_TOKEN || core.getInput('slack-app-token');

run({
  githubOwner,
  githubRepo,
  githubToken,
  slackAppToken,
  slackChannelId,
});
