import * as core from '@actions/core';
import GithubMetrics from './github-metrics';
import { WebClient } from '@slack/web-api';
import { constructSlackMessage } from './utils/slack';
import TimeToMergeMetric from './metrics/time-to-merge';
import MergedPRsMetric from './metrics/merged-prs';
import { setGithubArgs } from './utils/env';
import { getInterval, Period } from './utils/date';
import { fetchWorkflows } from './utils/api-requests';
import WorkflowDurationMetric from './metrics/workflow-duration';
import debug, { enableDebugging } from './utils/debug';

/**
 * The function that runs the following workflow:
 *
 * - Creates both Github and Slack clients
 * - Generates a weekly pull requests report
 * - Posts a message on Slack
 *
 * @public
 */
export async function run({
  githubOwner,
  githubRepo,
  githubToken,
  slackAppToken,
  slackChannelId,
  logDebugMessages,
}: {
  githubOwner: string;
  githubRepo: string;
  githubToken: string;
  slackAppToken: string;
  slackChannelId: string;
  logDebugMessages: string;
}): Promise<void> {
  setGithubArgs(githubOwner, githubRepo, githubToken);

  if (logDebugMessages) {
    console.log('enabling debugging');
    enableDebugging();
    debug.log = (...args) => console.log(...args);
  }

  try {
    const slack = new WebClient(slackAppToken);
    const githubMetrics = new GithubMetrics({
      token: githubToken,
    });
    const weeklyReport = await githubMetrics.generateWeeklyReport({
      owner: githubOwner,
      repo: githubRepo,
    });
    const metricsDocumentationUrl = 'https://git.io/JqCGq';

    const weekEndingNow = getInterval(Period.WEEK);

    const timeToMerge = new TimeToMergeMetric(weekEndingNow);
    await timeToMerge.run();

    const mergedPRs = new MergedPRsMetric(weekEndingNow);
    await mergedPRs.run();

    const workflows = await fetchWorkflows();
    let workflowDurationMetrics = [];
    for (let workflow of workflows) {
      let metric = new WorkflowDurationMetric(weekEndingNow, workflow);
      await metric.run();
      workflowDurationMetrics.push(metric);
    }

    const message = constructSlackMessage({
      header: `Weekly Metrics for ${weeklyReport.name} (${weeklyReport.startDate} - ${weeklyReport.endDate}) 📈`,
      footer:
        '_This is an automated post by <https://git.io/JqZ6w|github-metrics>._',
      sections: [
        {
          text: `<${weeklyReport.url}|View PRs on Github> | <${metricsDocumentationUrl}|About Metrics>`,
        },
        {
          text: `Number Of Pull Requests Opened: *${weeklyReport.openedPullRequests.length}*`,
        },
        {
          text: `${mergedPRs.name}: ${mergedPRs.summary}`,
        },
        {
          text: `Number Of Pull Requests Closed: *${weeklyReport.closedPullRequests.length}*`,
        },
        {
          text: [timeToMerge.name, timeToMerge.summary].join('\n'),
        },
        ...workflowDurationMetrics
          .filter((metric) => metric.data.length > 0)
          .map((metric) => {
            return {
              text: [metric.name, metric.summary].join('\n'),
            };
          }),
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
const logDebugMessages =
  process.env.LOG_DEBUG_MESSAGES || core.getInput('log-debug-messages');

run({
  githubOwner,
  githubRepo,
  githubToken,
  slackAppToken,
  slackChannelId,
  logDebugMessages,
});
