import { githubGraphqlClient } from '../utils/env';
import { singlePullRequest } from '../utils/graphql-queries';
import { DateTime, Duration } from 'luxon';
import { memoize } from '../utils/decorators';
export async function loadPullRequest(number: number): Promise<PullRequest> {
  let graphql = githubGraphqlClient();
  let data: any = await graphql(singlePullRequest(number));
  return new PullRequest(data.repository.pullRequest as GraphQLPRData);
}

const logger = {
  debug(message: string) {
    console.log(message);
  },
};

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
  constructor(public data: GraphQLPRData) {
    if (data.mergedAt) {
      this.mergedAt = DateTime.fromISO(data.mergedAt);
    }
    this.number = data.number;
    this.createdAt = DateTime.fromISO(data.createdAt);
  }

  @memoize()
  get timeToMerge(): Duration | void {
    if (!this.data.merged) {
      return;
    }

    if (this.openedForReviewAt && this.mergedAt) {
      return this.mergedAt.diff(this.openedForReviewAt);
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
    let eventsAsc = this.timelineItemsAsc;

    // If the PR was ever closed, only look at events *since* it was reopened
    let lastReopened = findLast(
      eventsAsc,
      ({ kind }) => kind === 'ReopenedEvent'
    );
    if (lastReopened) {
      eventsAsc = eventsAsc.slice(eventsAsc.indexOf(lastReopened));
    }

    // Last ReadyForReview
    let lastReadyForReview = findLast(
      eventsAsc,
      ({ kind }) => kind === 'ReadyForReviewEvent'
    );
    let firstReviewRequested = eventsAsc.find(
      ({ kind }) => kind === 'ReviewRequestedEvent'
    );

    let openedForReviewAt = null;
    if (lastReadyForReview) {
      logger.debug(
        `PR #${this.data.number} openedForReviewAt found lastReadyForReview: ${lastReadyForReview.datetime}`
      );
      openedForReviewAt = lastReadyForReview.datetime;
    } else if (firstReviewRequested) {
      // If no ReadyForReview, this was never in Draft state
      // Find first "ReviewRequested" instead
      logger.debug(
        `PR #${this.data.number} openedForReviewAt found firstReviewRequested: ${firstReviewRequested.datetime}`
      );
      openedForReviewAt = firstReviewRequested.datetime;
    } else {
      // Otherwise, this PR was opened up in non-draft-state
      if (lastReopened) {
        logger.debug(
          `PR #${this.data.number} openedForReviewAt using lastReopened: ${lastReopened.datetime}`
        );
        openedForReviewAt = lastReopened.datetime;
      } else {
        logger.debug(
          `PR #${this.data.number} openedForReviewAt defaulting to createdAt: ${this.createdAt}`
        );
        openedForReviewAt = this.createdAt;
      }
    }

    logger.debug(
      `PR: #${this.number} openedForReviewAt RETURN ${openedForReviewAt}`
    );
    return openedForReviewAt;
  }
}
