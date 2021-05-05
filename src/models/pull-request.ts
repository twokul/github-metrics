import { githubGraphqlClient } from '../utils/env';
import { singlePullRequest } from '../utils/graphql-queries';
import { DateTime, Duration } from 'luxon';
import { memoize } from '../utils/decorators';
import debugBase, { Debugger } from 'debug';
export async function loadPullRequest(number: number): Promise<PullRequest> {
  let graphql = githubGraphqlClient();
  let data: any = await graphql(singlePullRequest(number));
  return new PullRequest(data.repository.pullRequest as GraphQLPRData);
}

function findLast<T>(arr: Array<T>, predicate: (item: T) => boolean): T | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) {
      return arr[i];
    }
  }
  return null;
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

interface GraphQLPRData {
  mergedAt: string | null;
  number: number;
  merged: boolean;
  createdAt: string;
  author: { login: string };
  timelineItems: {
    nodes: Array<PullRequestReview | ReviewRequestedEvent>;
  };
}

type TimelineItem = {
  kind:
    | 'PullRequestReview'
    | 'ReviewRequestedEvent'
    | 'ReopenedEvent'
    | 'ReadyForReviewEvent';
  datetime: DateTime;
  login: string;
  node: any;
};

export class PullRequest {
  number: number;
  mergedAt: DateTime | undefined;
  createdAt: DateTime;
  debug: Debugger;
  constructor(public data: GraphQLPRData) {
    if (data.mergedAt) {
      this.mergedAt = DateTime.fromISO(data.mergedAt);
    }
    this.number = data.number;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.debug = debugBase('pull-request:' + this.number);
  }

  @memoize()
  get timeToMerge(): Duration | undefined {
    let debug = this.debug.extend('timeToMerge');
    if (!this.data.merged) {
      debug('not merged, returning');
      return undefined;
    }

    if (this.openedForReviewAt && this.mergedAt) {
      let diff = this.mergedAt.diff(this.openedForReviewAt);
      debug(
        'return %o (openedForReviewAt: %s -> mergedAt: %s)',
        diff.toObject(),
        this.openedForReviewAt,
        this.mergedAt
      );
      return diff;
    } else {
      return undefined;
    }
  }

  @memoize()
  get timelineItemsAsc(): Array<TimelineItem> {
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
    let debug = this.debug.extend('openedForReviewAt');
    let eventsAsc = this.timelineItemsAsc;

    // If the PR was ever closed, only look at events *since* it was reopened
    let lastReopened = findLast(
      eventsAsc,
      ({ kind }) => kind === 'ReopenedEvent'
    );
    if (lastReopened) {
      eventsAsc = eventsAsc.slice(eventsAsc.lastIndexOf(lastReopened));
    }

    // Last ReadyForReview
    let lastReadyForReview = findLast(
      eventsAsc,
      ({ kind }) => kind === 'ReadyForReviewEvent'
    );
    let firstReviewRequested = eventsAsc.find(
      ({ kind }) => kind === 'ReviewRequestedEvent'
    );

    if (
      firstReviewRequested &&
      this.mergedAt &&
      firstReviewRequested.datetime > this.mergedAt
    ) {
      debug(
        `firstReviewRequested was after mergedAt, ignoring (was: ${firstReviewRequested.datetime})`
      );
      firstReviewRequested = undefined;
    }

    let openedForReviewAt = null;
    if (lastReadyForReview) {
      debug(`found lastReadyForReview: ${lastReadyForReview.datetime}`);
      openedForReviewAt = lastReadyForReview.datetime;
    } else if (firstReviewRequested) {
      // If no ReadyForReview, this was never in Draft state
      // Find first "ReviewRequested" instead
      debug(`found firstReviewRequested: ${firstReviewRequested.datetime}`);
      openedForReviewAt = firstReviewRequested.datetime;
    } else {
      // Otherwise, this PR was opened up in non-draft-state
      if (lastReopened) {
        this.debug(`using lastReopened: ${lastReopened.datetime}`);
        openedForReviewAt = lastReopened.datetime;
      } else {
        this.debug(`defaulting to createdAt: ${this.createdAt}`);
        openedForReviewAt = this.createdAt;
      }
    }

    debug(`RETURN ${openedForReviewAt}`);
    return openedForReviewAt;
  }
}
