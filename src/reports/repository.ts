import { Interval } from 'luxon';
import { PullRequest, PullRequestState } from '../github-client';
import PullRequestReport, { PullRequestReviewDepth } from './pull-request';
import { humanFormattedInterval } from '../utils/date';

export default class RepositoryReport {
  #owner;

  #repo;

  #pullRequests;
  #interval;

  constructor({
    owner,
    repo,
    pullRequests,
    interval,
  }: {
    owner: string;
    repo: string;
    pullRequests: Array<PullRequest>;
    interval: Interval;
  }) {
    this.#owner = owner;
    this.#repo = repo;
    this.#pullRequests = pullRequests;
    this.#interval = interval;
  }

  /**
   * The name of the report.
   */
  get name(): string {
    return `${this.#owner}/${this.#repo}`;
  }

  /**
   * Link to the Github Pull Request page with all pull requests listed in the
   * report between start and end date.
   */
  get url(): string {
    let intervalString = `${this.#interval.start.toISO()}..${this.#interval.end.toISO()}`;
    return `https://github.com/${this.#owner}/${
      this.#repo
    }/pulls?q=created:${intervalString}`;
  }

  /**
   * Returns a verbose but human-readable interval, like
   * "April 20, 2017, 11:32 AM EDT to April 28, 2017, 11:32 AM EDT"
   */
  get humanFormattedInterval(): string {
    return humanFormattedInterval(this.#interval);
  }

  /**
   * The number of opened pull requests.
   */
  get openedPullRequests(): Array<PullRequest> {
    return this.#pullRequests.filter(
      (pr) => pr.state === PullRequestState.OPENED
    );
  }

  /**
   * The number of closed pull requests.
   */
  get closedPullRequests(): Array<PullRequest> {
    return this.#pullRequests.filter(
      (pr) => pr.state === PullRequestState.CLOSED
    );
  }

  /**
   * The number of merged pull requests.
   */
  get mergedPullRequests(): Array<PullRequest> {
    return this.#pullRequests.filter(
      (pr) => pr.state === PullRequestState.MERGED
    );
  }

  /**
   * The number of opened and merged pull requests.
   */
  get mergedAndOpened(): Array<PullRequest> {
    return this.#pullRequests.filter(
      (pullRequest) => pullRequest.state != PullRequestState.CLOSED
    );
  }

  /**
   * The number of pull requests against `release/*` branch.
   */
  get hotfixes(): number {
    const hotfixes = this.#pullRequests
      .map((pr) => new PullRequestReport(pr))
      .filter((pr) => pr.isHotfix);

    return hotfixes.length;
  }

  /**
   * Calculates the average time to merge for the merged pull requests.
   *
   * Time to merge is the amount of time elapsed from "pull request created" to
   * "pull request merged".
   */
  get averageTimeToMerge(): number {
    if (this.#pullRequests.length === 0) {
      return 0;
    }

    const totalTimeToMerge = this.mergedPullRequests
      .map((pullRequest) => {
        const analysis = new PullRequestReport(pullRequest);

        return Number(analysis.timeToMerge.toFormat('h'));
      })
      .reduce((sum, value) => (sum += value), 0);

    return totalTimeToMerge / this.mergedPullRequests.length;
  }

  /**
   * Calculates the average review depth for all pull requests.
   *
   * This includes:
   * - number of comments
   * - number of reviews
   * - number of reviewers
   */
  get aggregatedReviewDepth(): PullRequestReviewDepth {
    const reviewDepth: PullRequestReviewDepth = {
      comments: 0,
      reviews: 0,
      reviewers: 0,
    };

    this.#pullRequests
      .map((pullRequest) => {
        const analysis = new PullRequestReport(pullRequest);

        return analysis.reviewDepth;
      })
      .forEach((analysis) => {
        reviewDepth.comments + analysis.comments;
        reviewDepth.reviewers += analysis.reviewers;
        reviewDepth.reviews += analysis.reviews;
      });

    return reviewDepth;
  }

  /**
   * Calculates the average idle time for the merged or opened pull requests.
   *
   * Idle time is the amount of time elapsed from "pull request created" to
   * "first review submitted".
   */
  get averageIdleTime(): number {
    if (this.#pullRequests.length === 0) {
      return 0;
    }

    const totalIdleTime = this.mergedAndOpened
      .map((pullRequest) => {
        const analysis = new PullRequestReport(pullRequest);

        return Number(analysis.idleTime.toFormat('h'));
      })
      .reduce((sum, value) => (sum += value), 0);

    return totalIdleTime / this.mergedAndOpened.length;
  }
}
