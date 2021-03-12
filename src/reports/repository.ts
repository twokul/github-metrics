import { PullRequest, PullRequestState } from '../github-client';
import PullRequestReport, { PullRequestReviewDepth } from './pull-request';

export default class RepositoryReport {
  #owner;

  #repo;

  #pullRequests;

  #startDate;

  #endDate;

  constructor({
    owner,
    repo,
    pullRequests,
    startDate,
    endDate,
  }: {
    owner: string;
    repo: string;
    pullRequests: Array<PullRequest>;
    startDate: string;
    endDate: string;
  }) {
    this.#owner = owner;
    this.#repo = repo;
    this.#pullRequests = pullRequests;
    this.#startDate = startDate;
    this.#endDate = endDate;
  }

  get name(): string {
    return `${this.#owner}/${this.#repo}`;
  }

  get url(): string {
    return `https://github.com/${this.#owner}/${this.#repo}/pulls?q=created:${
      this.#startDate
    }..${this.#endDate}`;
  }

  get startDate(): string {
    return this.#startDate;
  }

  get endDate(): string {
    return this.#endDate;
  }

  get openedPullRequests(): Array<PullRequest> {
    return this.#pullRequests.filter(
      (pr) => pr.state === PullRequestState.OPENED
    );
  }

  get closedPullRequests(): Array<PullRequest> {
    return this.#pullRequests.filter(
      (pr) => pr.state === PullRequestState.CLOSED
    );
  }

  get mergedPullRequests(): Array<PullRequest> {
    return this.#pullRequests.filter(
      (pr) => pr.state === PullRequestState.MERGED
    );
  }

  get hotfixes(): number {
    const hotfixes = this.#pullRequests
      .map((pr) => new PullRequestReport(pr))
      .filter((pr) => pr.isHotfix);

    return hotfixes.length;
  }

  get averageTimeToMerge(): number {
    if (this.#pullRequests.length === 0) {
      return 0;
    }

    const totalTimeToMerge = this.#pullRequests
      .filter((pullRequest) => pullRequest.state != PullRequestState.CLOSED)
      .map((pullRequest) => {
        const analysis = new PullRequestReport(pullRequest);

        return Number(analysis.timeToMerge.toFormat('h'));
      })
      .reduce((sum, value) => (sum += value), 0);

    return totalTimeToMerge / this.#pullRequests.length;
  }

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

  get averageIdleTime(): number {
    if (this.#pullRequests.length === 0) {
      return 0;
    }

    const totalIdleTime = this.#pullRequests
      .filter((pullRequest) => pullRequest.state != PullRequestState.CLOSED)
      .map((pullRequest) => {
        const analysis = new PullRequestReport(pullRequest);

        return Number(analysis.idleTime.toFormat('h'));
      })
      .reduce((sum, value) => (sum += value), 0);

    return totalIdleTime / this.#pullRequests.length;
  }
}
