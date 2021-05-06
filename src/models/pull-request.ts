import { githubGraphqlClient } from '../utils/env';
import { singlePullRequest } from '../utils/graphql-queries';
import { DateTime, Duration } from 'luxon';
import debug, { Debugger } from '../utils/debug';

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
  mergedAt?: DateTime;
  createdAt: DateTime;
  debug: Debugger;
  _memoizeCache: Map<string, any>;
  constructor(public data: GraphQLPRData) {
    if (data.mergedAt) {
      this.mergedAt = DateTime.fromISO(data.mergedAt);
    }
    this.number = data.number;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.debug = debug.extend('pull-request:' + this.number);
    this._memoizeCache = new Map();
  }

  get timeToMerge(): Duration | undefined {
    if (this._memoizeCache.has('timeToMerge')) {
      return this._memoizeCache.get('timeToMerge');
    }

    let timeToMerge = undefined;
    let debug = this.debug.extend('timeToMerge');
    if (this.data.merged) {
      if (this.openedForReviewAt && this.mergedAt) {
        let diff = this.mergedAt.diff(this.openedForReviewAt);
        debug(
          'return %o (openedForReviewAt: %s -> mergedAt: %s)',
          diff.toObject(),
          this.openedForReviewAt,
          this.mergedAt
        );
        timeToMerge = diff;
      }
    }

    this._memoizeCache.set('timeToMerge', timeToMerge);
    return timeToMerge;
  }

  get timelineItemsAsc(): Array<TimelineItem> {
    if (this._memoizeCache.has('timelineItemsAsc')) {
      return this._memoizeCache.get('timelineItemsAsc');
    }

    let events = this.data.timelineItems.nodes.map((node: any) => {
      let kind = node.__typename;
      let datetime = DateTime.fromISO(node.createdAt);
      let login = node.actor?.login || node.author?.login;
      return { kind, datetime, login, node };
    });
    events.sort((a: any, b: any) => a.createdAt - b.createdAt);

    this._memoizeCache.set('timelineItemsAsc', events);
    return events;
  }

  // The PR is opened for review when:
  // - only counting events that occur after the *last* "reopened" event (if any):
  //   - last "ReadyForReview" event occurs (aka convert FROM draft to open)
  //   - OR: first ReviewRequested
  get openedForReviewAt(): DateTime | undefined {
    if (this._memoizeCache.has('openedForReviewAt')) {
      return this._memoizeCache.get('openedForReviewAt');
    }

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

    let openedForReviewAt = undefined;
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
    this._memoizeCache.set('openedForReviewAt', openedForReviewAt);
    return openedForReviewAt;
  }
}
