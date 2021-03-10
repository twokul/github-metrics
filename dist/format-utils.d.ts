import { ChatPostMessageArguments } from '@slack/web-api';
export declare function constructDailyGithubMetricsSlackMessage({ content, text, channel }: {
    content: {
        repoName: string;
        openPullRequests: number;
        closedPullRequests: number;
        mergedPullRequests: number;
        averageIdleTime: number;
        averageTimeToMerge: number;
        aggregatedReviewDepth: {
            comments: number;
            reviews: number;
            reviewers: number;
        };
        hotfixes: number;
    };
    text: string;
    channel: string;
}): ChatPostMessageArguments;
