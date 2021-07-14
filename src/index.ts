import * as core from '@actions/core';
import GithubMetrics from './github-metrics';
import { WebClient } from '@slack/web-api';
import { constructSlackMessage } from './utils/slack';
import { setGithubArgs } from './utils/env';
import { fetchWorkflows } from './utils/api-requests';
import debug, { enableDebugging } from './utils/debug';
import { parse } from 'yaml';
import {
  MetricsConfig,
  generateMetrics,
} from './utils/generate-metrics-from-config';

const DEFAULT_CONFIG_YML = `
period: 'week'

# Runs all metrics, by default
metrics:
 - name: 'pull-request/merged'
 - name: 'pull-request/time-to-merge'
 - name: 'workflow/duration'
 - name: 'workflow/success'
`.trim();

// Configuration options that can be passed
// via environment variables or, when run via
// a github actions (GHA) workflow, GHA input values.
type CommandLineConfiguration = {
  githubOwner: string;
  githubRepo: string;
  githubToken: string;
  slackChannelId: string;
  slackAppToken: string;
  postToSlack: boolean;
  logDebugMessages: boolean;
  metricsConfig: MetricsConfig;
};

function loadCommandLineConfiguration(): CommandLineConfiguration {
  const githubOwner = process.env.GITHUB_OWNER || core.getInput('github-owner');
  const githubRepo = process.env.GITHUB_REPO || core.getInput('github-repo');
  const githubToken = process.env.GITHUB_TOKEN || core.getInput('github-token');
  const slackChannelId =
    process.env.SLACK_CHANNEL_ID || core.getInput('slack-channel-id');
  const slackAppToken =
    process.env.SLACK_APP_TOKEN || core.getInput('slack-app-token');
  const logDebugMessages =
    process.env.LOG_DEBUG_MESSAGES || core.getInput('log-debug-messages');
  const postToSlack =
    process.env.POST_TO_SLACK || core.getInput('post-to-slack');

  const configYml =
    process.env.CONFIG_YML || core.getInput('config-yml') || DEFAULT_CONFIG_YML;
  const config = parse(configYml);

  return {
    githubOwner,
    githubRepo,
    githubToken,
    slackChannelId,
    slackAppToken,
    postToSlack: postToSlack === 'true',
    logDebugMessages: logDebugMessages === 'true',
    metricsConfig: config,
  };
}

/**
 * Loads the configuration and generates an overall report
 * based on the metric(s) requested in the configuration.
 *
 * Posts to slack if the `postToSlack` config option is true.
 *
 * @public
 */
export async function run(): Promise<void> {
  let config = loadCommandLineConfiguration();
  setGithubArgs(config.githubOwner, config.githubRepo, config.githubToken);

  if (config.logDebugMessages) {
    enableDebugging();
    debug.log = (...args) => console.log(...args);
  }

  try {
    const githubMetrics = new GithubMetrics({
      token: config.githubToken,
    });
    const weeklyReport = await githubMetrics.generateWeeklyReport({
      owner: config.githubOwner,
      repo: config.githubRepo,
    });
    const metricsDocumentationUrl = 'https://git.io/JqCGq';

    const workflows = await fetchWorkflows();
    const metrics = generateMetrics(config.metricsConfig, workflows);

    for (const metric of metrics) {
      // We could run these concurrently via Promise.all, but that would
      // interleave the debug messages.  We usually don't care (a lot) about how
      // long it takes to run this report, so trading off some speed for better
      // debug observability is a good choice.
      await metric.run();
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
        ...metrics.map((metric) => ({
          text: [metric.name, metric.summary].join('\n'),
        })),
        {
          text: `Number Of Pull Requests Closed: *${weeklyReport.closedPullRequests.length}*`,
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
      channel: config.slackChannelId,
    });

    core.info(JSON.stringify(message, null, 2));

    const slack = new WebClient(config.slackAppToken);
    if (config.postToSlack) {
      const result = await slack.chat.postMessage(message);
      core.debug(
        `Successfully posted message ${result.ts} in conversation ${config.slackChannelId}`
      );
    } else {
      core.debug(`Not posting message to slack`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
