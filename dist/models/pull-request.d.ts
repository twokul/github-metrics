import { DateTime, Duration } from 'luxon';
import { Debugger } from '../utils/debug';
export declare function loadPullRequest(number: number): Promise<PullRequest>;
interface CreationDetails {
    __typename: string;
    createdAt: string;
    author: {
        login: string;
    };
}
interface PullRequestReview extends CreationDetails {
    __typename: 'PullRequestReview';
    state: 'PENDING' | 'COMMENTED' | 'APPROVED' | 'CHANGES_REQUESTED' | 'DISMISSED';
}
interface ReviewRequestedEvent extends CreationDetails {
    __typename: 'ReviewRequestedEvent';
}
interface GraphQLPRData {
    mergedAt: string | null;
    number: number;
    merged: boolean;
    createdAt: string;
    author: {
        login: string;
    };
    timelineItems: {
        nodes: Array<PullRequestReview | ReviewRequestedEvent>;
    };
}
declare type TimelineItem = {
    kind: 'PullRequestReview' | 'ReviewRequestedEvent' | 'ReopenedEvent' | 'ReadyForReviewEvent';
    datetime: DateTime;
    login: string;
    node: any;
};
export declare class PullRequest {
    data: GraphQLPRData;
    number: number;
    mergedAt?: DateTime;
    createdAt: DateTime;
    debug: Debugger;
    _memoizeCache: Map<string, any>;
    constructor(data: GraphQLPRData);
    get timeToMerge(): Duration | undefined;
    get timelineItemsAsc(): Array<TimelineItem>;
    get openedForReviewAt(): DateTime | undefined;
}
export {};
