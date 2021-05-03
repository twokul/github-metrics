import { DateTime, Duration, Interval } from 'luxon';
import GithubClient from '../github-client';
import { singlePRQuery, mergedPRsQuery } from '../utils/graphql';
import logger from '../utils/logger';
import { humanFormattedDuration } from '../utils/date';
import { memoize } from '../utils/decorators';

interface PR {
  mergedAt?: DateTime;
  createdAt: DateTime;
  title: string;
  number: number;
}

interface CreationDetails {
  __typename: string;
  createdAt: string;
  author: { login: string };
}

interface PullRequestReview extends CreationDetails {
  __typename: 'PullRequestReview';
  state:
    | 'PENDING'
    | 'COMMENTED'
    | 'APPROVED'
    | 'CHANGES_REQUESTED'
    | 'DISMISSED';
}

interface ReviewRequestedEvent extends CreationDetails {
  __typename: 'ReviewRequestedEvent';
}

interface GraphQLPR {
  mergedAt: string | null;
  number: number;
  merged: boolean;
  createdAt: string;
  author: { login: string };
  timelineItems: {
    nodes: Array<PullRequestReview | ReviewRequestedEvent>;
  };
}

class PullRequestDecorator implements PR {
  constructor(public data: GraphQLPR) {}

  get number(): number {
    return this.data.number;
  }

  get title(): string {
    return this.data.title;
  }

  get merged(): boolean {
    return this.data.merged;
  }

  @memoize()
  get mergedAt(): DateTime | undefined {
    if (this.data.mergedAt) {
      return DateTime.fromISO(this.data.mergedAt);
    }
    return;
  }

  @memoize()
  get createdAt(): DateTime {
    return DateTime.fromISO(this.data.createdAt);
  }

  @memoize()
  get timeToFirstInteraction(): Duration | void {
    if (this.firstInteractionAt && this.openedForReviewAt) {
      return this.firstInteractionAt.diff(this.openedForReviewAt);
    }
  }

  @memoize()
  get timeToMerge(): Duration | void {
    if (!this.merged) {
      return;
    }
    if (this.openedForReviewAt && this.mergedAt) {
      return this.mergedAt.diff(this.openedForReviewAt);
    }
  }

  @memoize()
  get timelineItemsAsc(): Array<any> {
    let events = this.data.timelineItems.nodes.map((node: any) => {
      let kind = node.__typename;
      let datetime = DateTime.fromISO(node.createdAt);
      let login = node.actor?.login || node.author?.login;
      return { kind, datetime, login, node };
    });
    events.sort((a: any, b: any) => a.createdAt - b.createdAt);
    return events;
  }

  // The PR is opened for review when:
  // - only counting events that occur after the *last* "reopened" event (if any):
  //   - last "ReadyForReview" event occurs (aka convert FROM draft to open)
  //   - OR: first ReviewRequested
  @memoize()
  get openedForReviewAt(): DateTime | void {
    let eventsAsc = this.timelineItemsAsc;
    let eventsDesc = eventsAsc.slice().reverse();

    // If the PR was ever closed, only look at events *since* it was reopened
    let lastReopened = eventsDesc.find(
      (event) => event.kind === 'ReopenedEvent'
    );
    if (lastReopened) {
      logger.debug(
        `PR #${this.number} openedForReviewAt slicing after lastReopened: ${lastReopened.datetime}`
      );
      eventsAsc = eventsAsc.slice(eventsAsc.indexOf(lastReopened));
      eventsDesc = eventsAsc.slice().reverse();
    }

    // Last ReadyForReview
    let lastReadyForReview = eventsDesc.find(
      (event) => event.kind === 'ReadyForReviewEvent'
    );
    let firstReviewRequested = eventsAsc.find(
      (event) => event.kind === 'ReviewRequested'
    );

    let openedForReviewAt = null;
    if (lastReadyForReview) {
      logger.debug(
        `PR #${this.number} openedForReviewAt found lastReadyForReview: ${lastReadyForReview.datetime}`
      );
      openedForReviewAt = lastReadyForReview.datetime;
    } else if (firstReviewRequested) {
      // If no ReadyForReview, this was never in Draft state
      // Find first "ReviewRequested" instead
      logger.debug(
        `PR #${this.number} openedForReviewAt found firstReviewRequested: ${firstReviewRequested.datetime}`
      );
      openedForReviewAt = firstReviewRequested.datetime;
    } else {
      // Otherwise, this PR was opened up in non-draft-state
      if (lastReopened) {
        openedForReviewAt = lastReopened.datetime;
      } else {
        openedForReviewAt = this.createdAt;
      }
    }

    logger.debug(
      `PR: #${this.number} openedForReviewAt RETURN ${openedForReviewAt}`
    );
    return openedForReviewAt;
  }

  get login(): string {
    return this.data.author.login;
  }

  @memoize()
  get firstInteractionAt(): DateTime | void {
    let login = this.login;

    let eventsAsc = this.timelineItemsAsc;
    let eventsDesc = eventsAsc.slice().reverse();

    let lastReopened = eventsDesc.find(
      (event) => event.kind === 'ReopenedEvent'
    );
    if (lastReopened) {
      eventsAsc = eventsAsc.slice(eventsAsc.indexOf(lastReopened));
      eventsDesc = eventsAsc.slice().reverse();
    }

    let reviews = eventsAsc.filter(
      (event) => event.kind === 'PullRequestReview'
    );
    let firstExternalReview = reviews.find((event) => event.login !== login);
    return firstExternalReview?.datetime;
  }
}

export class PullRequestReport {
  owner: string;
  repo: string;
  number: number;
  #client: GithubClient;
  constructor(owner: string, repo: string, number: number) {
    this.owner = owner;
    this.repo = repo;
    this.number = number;
    this.#client = new GithubClient();
  }

  async run() {
    let result: any = await this.#client.query(
      singlePRQuery(this.owner, this.repo, this.number)
    );
    let pr = new PullRequestDecorator(result.repository.pullRequest);

    let ttfi = pr.timeToFirstInteraction;
    let ttm = pr.timeToMerge;
    console.log(`PR TTFI: ${ttfi && humanFormattedDuration(ttfi)}`);
    console.log(`PR TTM: ${ttm && humanFormattedDuration(ttm)}`);
  }
}

/**
 * A report over an interval of the pull requests
 */
export default class PullRequestsReport {
  #client: GithubClient;

  constructor(
    private owner: string,
    private repo: string,
    private interval: Interval
  ) {
    this.#client = new GithubClient();
  }

  async fetchMergedPRs(): Promise<Array<PullRequestDecorator>> {
    let query = mergedPRsQuery(this.owner, this.repo, this.interval);
    let result: any = await this.#client.query(query);
    let prs = result.search.nodes.map(
      (data: any) => new PullRequestDecorator(data)
    );
    return prs;
  }
}
