import { PullRequest } from '../github-client';
import { PullRequestReviewDepth } from './pull-request';
export default class RepositoryReport {
    #private;
    constructor({ owner, repo, pullRequests, startDate, endDate, }: {
        owner: string;
        repo: string;
        pullRequests: Array<PullRequest>;
        startDate: string;
        endDate: string;
    });
    get name(): string;
    get url(): string;
    get startDate(): string;
    get endDate(): string;
    get openedPullRequests(): Array<PullRequest>;
    get closedPullRequests(): Array<PullRequest>;
    get mergedPullRequests(): Array<PullRequest>;
    get mergedAndOpened(): Array<PullRequest>;
    get hotfixes(): number;
    get averageTimeToMerge(): number;
    get aggregatedReviewDepth(): PullRequestReviewDepth;
    get averageIdleTime(): number;
}
