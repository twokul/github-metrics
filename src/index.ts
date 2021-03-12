import * as core from '@actions/core';
import GithubMetrics from './github-metrics';
import { WebClient } from '@slack/web-api';
import { constructSlackMessage } from './utils/slack';
import { DateTime } from 'luxon';

export async function run({
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
    const weeklyReport = await githubMetrics.generateWeeklyReport({
      owner: githubOwner,
      repo: githubRepo,
    });
    const formattedStartDate = DateTime.fromISO(weeklyReport.startDate).toISODate();
    const formattedEndDate = DateTime.fromISO(weeklyReport.endDate).toISODate();

    const message = constructSlackMessage({
      header: `Weekly Metrics for ${weeklyReport.name} (${formattedStartDate} - ${formattedEndDate}) 📈`,
      footer:
        '_This is an automated post by <https://git.io/JqZ6w|github-metrics>._',
      sections: [
        {
          text: `<${weeklyReport.url}|View PRs on Github>`,
        },
        {
          text: `Number Of Pull Requests Opened: *${weeklyReport.openedPullRequests.length}*`,
        },
        {
          text: `Number Of Pull Requests Merged: *${weeklyReport.mergedPullRequests.length}*`,
        },
        {
          text: `Number Of Pull Requests Closed: *${weeklyReport.closedPullRequests.length}*`,
        },
        {
          text: `Average Time To Merge: *${
            weeklyReport.averageTimeToMerge
              ? weeklyReport.averageTimeToMerge.toFixed(1)
              : null
          } hours*`,
        },
        {
          text: `Average Pull Request Idle Time: *${
            weeklyReport.averageIdleTime
              ? weeklyReport.averageIdleTime.toFixed(1)
              : null
          } hours*`,
        },
        {
          text: `Review Depth: *${weeklyReport.aggregatedReviewDepth.comments} comments, ${weeklyReport.aggregatedReviewDepth.reviews} reviews by ${weeklyReport.aggregatedReviewDepth.reviewers} people*`,
        },
        {
          text: `Number Of Hotfixes: *${weeklyReport.hotfixes}*`,
        },
      ],
      channel: slackChannelId,
    });
    const result = await slack.chat.postMessage(message);

    core.debug(
      `Successfully send message ${result.ts} in conversation ${slackChannelId}`
    );
  } catch (error) {
    core.setFailed(error.message);
  }
}

const githubOwner = process.env.GITHUB_OWNER || core.getInput('github-owner');
const githubRepo = process.env.GITHUB_REPO || core.getInput('github-repo');
const githubToken = process.env.GITHUB_TOKEN || core.getInput('github-token');
const slackChannelId =
  process.env.SLACK_CHANNEL_ID || core.getInput('slack-channel-id');
const slackAppToken =
  process.env.SLACK_APP_TOKEN || core.getInput('slack-app-token');

run({
  githubOwner,
  githubRepo,
  githubToken,
  slackAppToken,
  slackChannelId,
});
