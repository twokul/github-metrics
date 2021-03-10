import { PullRequest, PullRequestState } from '../github-client';
import PullRequestAnalysis, { PullRequestReviewDepth } from './pull-request';

export default class RepositoryReport {
  #owner;

  #repo;

  #pullRequests;

  constructor({ owner, repo, pullRequests }: { owner: string, repo: string, pullRequests: Array<PullRequest> }) {
    this.#owner = owner;
    this.#repo = repo;
    this.#pullRequests = pullRequests;
  }

  get name(): string {
    return `${this.#owner}/${this.#repo}`;
  }

  get openedPullRequests(): Array<PullRequest> {
    return this.#pullRequests.filter((pr) => pr.state === PullRequestState.OPENED);
  }

  get closedPullRequests(): Array<PullRequest> {
    return this.#pullRequests.filter((pr) => pr.state === PullRequestState.CLOSED);
  }

  get mergedPullRequests(): Array<PullRequest> {
    return this.#pullRequests.filter((pr) => pr.state === PullRequestState.MERGED);
  }

  get hotfixes(): number {
    const hotfixes = this.#pullRequests.map((pr) => new PullRequestAnalysis(pr)).filter((pr) => pr.isHotfix);

    return hotfixes.length;
  }

  get averageTimeToMerge(): number {
    const totalTimeToMerge = this.#pullRequests
      .map((pullRequest) => {
        const analysis = new PullRequestAnalysis(pullRequest);

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
        const analysis = new PullRequestAnalysis(pullRequest);

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
    const totalIdleTime = this.#pullRequests
      .map((pullRequest) => {
        const analysis = new PullRequestAnalysis(pullRequest);

        return Number(analysis.idleTime.toFormat('h'));
      })
      .reduce((sum, value) => (sum += value), 0);

    return totalIdleTime / this.#pullRequests.length;
  }
}
