import { Duration } from 'luxon';
import { PullRequest } from '../github-client';
export declare type PullRequestReviewDepth = {
    comments: number;
    reviews: number;
    reviewers: number;
};
export default class PullRequestReport {
    #private;
    constructor(pullRequest: PullRequest);
    get title(): string;
    get pullRequestNumber(): number;
    get idleTime(): Duration;
    get isHotfix(): boolean;
    get timeToMerge(): Duration;
    get reviewDepth(): PullRequestReviewDepth;
}
