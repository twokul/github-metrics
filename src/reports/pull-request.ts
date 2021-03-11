import { DateTime, Duration } from 'luxon';
import { PullRequest } from '../github-client';

export type PullRequestReviewDepth = {
  comments: number;
  reviews: number;
  reviewers: number;
};

export default class PullRequestReport {
  #pullRequest;

  constructor(pullRequest: PullRequest) {
    this.#pullRequest = pullRequest;
  }

  get title(): string {
    return this.#pullRequest.title;
  }

  get pullRequestNumber(): number {
    return this.#pullRequest.number;
  }

  get idleTime(): Duration {
    const createdAt = this.#pullRequest.createdAt;
    const submittedAt =
      this.#pullRequest.reviews.length === 0 ? DateTime.now().toString() : this.#pullRequest.reviews[0].submittedAt;
    const createdAtDateTime = DateTime.fromISO(createdAt);
    const submittedAtDateTime = DateTime.fromISO(submittedAt);

    return submittedAtDateTime.diff(createdAtDateTime);
  }

  get isHotfix(): boolean {
    return this.#pullRequest.baseRefName.startsWith('release/');
  }

  get timeToMerge(): Duration {
    const createdAt = this.#pullRequest.createdAt;
    const mergedAt = this.#pullRequest.mergedAt;
    const createdAtDateTime = DateTime.fromISO(createdAt);
    const mergedAtDateTime = mergedAt ? DateTime.fromISO(mergedAt) : DateTime.now();

    return mergedAtDateTime.diff(createdAtDateTime);
  }

  get reviewDepth(): PullRequestReviewDepth {
    const reviewers = new Set();

    this.#pullRequest.reviews.forEach((pullRequestReview) => reviewers.add(pullRequestReview.author));

    return {
      comments: this.#pullRequest.comments.length,
      reviewers: reviewers.size,
      reviews: this.#pullRequest.reviews.length,
    } as PullRequestReviewDepth;
  }
}
