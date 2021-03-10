import { PullRequest } from '../github-client';
import { PullRequestReviewDepth } from './pull-request';
export default class RepositoryReport {
    #private;
    constructor({ owner, repo, pullRequests }: {
        owner: string;
        repo: string;
        pullRequests: Array<PullRequest>;
    });
    get name(): string;
    get openedPullRequests(): Array<PullRequest>;
    get closedPullRequests(): Array<PullRequest>;
    get mergedPullRequests(): Array<PullRequest>;
    get hotfixes(): number;
    get averageTimeToMerge(): number;
    get aggregatedReviewDepth(): PullRequestReviewDepth;
    get averageIdleTime(): number;
}
