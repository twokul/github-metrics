"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructDailyGithubMetricsSlackMessage = void 0;
function constructDailyGithubMetricsSlackMessage({ content, text = '', channel }) {
    const { repoName, openPullRequests, closedPullRequests, mergedPullRequests, averageTimeToMerge, averageIdleTime, aggregatedReviewDepth, hotfixes, } = content;
    return {
        text,
        channel,
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `Daily Metrics for ${repoName} 📈`,
                    emoji: true,
                },
            },
            {
                type: 'divider',
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Number Of Pull Requests Opened: *${openPullRequests}*`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Number Of Pull Requests Merged: *${mergedPullRequests}*`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Number Of Pull Requests Closed: *${closedPullRequests}*`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Average Time To Merge: *${averageTimeToMerge} hours*`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Average Pull Request Idle Time: *${averageIdleTime} hours*`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Review Depth: *${aggregatedReviewDepth.comments} comments, ${aggregatedReviewDepth.reviews} reviews by ${aggregatedReviewDepth.reviewers} people*`,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Number Of Hotfixes: *${hotfixes}*`,
                },
            },
            {
                type: 'divider',
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '_This is an automated post by <https://git.io/JqZ6w|github-metrics>._',
                },
            },
        ],
    };
}
exports.constructDailyGithubMetricsSlackMessage = constructDailyGithubMetricsSlackMessage;
