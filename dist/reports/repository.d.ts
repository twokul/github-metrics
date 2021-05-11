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
    /**
     * The name of the report.
     */
    get name(): string;
    /**
     * Link to the Github Pull Request page with all pull requests listed in the
     * report between start and end date.
     */
    get url(): string;
    /**
     * The start date of the report.
     */
    get startDate(): string;
    /**
     * The end date of the report.
     */
    get endDate(): string;
    /**
     * The number of opened pull requests.
     */
    get openedPullRequests(): Array<PullRequest>;
    /**
     * The number of closed pull requests.
     */
    get closedPullRequests(): Array<PullRequest>;
    /**
     * The number of opened and merged pull requests.
     */
    get mergedAndOpened(): Array<PullRequest>;
    /**
     * The number of pull requests against `release/*` branch.
     */
    get hotfixes(): number;
    /**
     * Calculates the average review depth for all pull requests.
     *
     * This includes:
     * - number of comments
     * - number of reviews
     * - number of reviewers
     */
    get aggregatedReviewDepth(): PullRequestReviewDepth;
    /**
     * Calculates the average idle time for the merged or opened pull requests.
     *
     * Idle time is the amount of time elapsed from "pull request created" to
     * "first review submitted".
     */
    get averageIdleTime(): number;
}
