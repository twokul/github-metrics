"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequest = exports.loadPullRequest = void 0;
const env_1 = require("../utils/env");
const graphql_queries_1 = require("../utils/graphql-queries");
const luxon_1 = require("luxon");
const debug_1 = require("../utils/debug");
async function loadPullRequest(number) {
    let graphql = env_1.githubGraphqlClient();
    let data = await graphql(graphql_queries_1.singlePullRequest(number));
    return new PullRequest(data.repository.pullRequest);
}
exports.loadPullRequest = loadPullRequest;
function findLast(arr, predicate) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (predicate(arr[i])) {
            return arr[i];
        }
    }
    return null;
}
class PullRequest {
    constructor(data) {
        this.data = data;
        if (data.mergedAt) {
            this.mergedAt = luxon_1.DateTime.fromISO(data.mergedAt);
        }
        this.number = data.number;
        this.createdAt = luxon_1.DateTime.fromISO(data.createdAt);
        this.debug = debug_1.default.extend('pull-request:' + this.number);
        this._memoizeCache = new Map();
    }
    get timeToMerge() {
        if (this._memoizeCache.has('timeToMerge')) {
            return this._memoizeCache.get('timeToMerge');
        }
        let timeToMerge = undefined;
        let debug = this.debug.extend('timeToMerge');
        if (this.data.merged) {
            if (this.openedForReviewAt && this.mergedAt) {
                let diff = this.mergedAt.diff(this.openedForReviewAt);
                debug('return %o (openedForReviewAt: %s -> mergedAt: %s)', diff.toObject(), this.openedForReviewAt, this.mergedAt);
                timeToMerge = diff;
            }
        }
        this._memoizeCache.set('timeToMerge', timeToMerge);
        return timeToMerge;
    }
    get timelineItemsAsc() {
        if (this._memoizeCache.has('timelineItemsAsc')) {
            return this._memoizeCache.get('timelineItemsAsc');
        }
        let events = this.data.timelineItems.nodes.map((node) => {
            var _a, _b;
            let kind = node.__typename;
            let datetime = luxon_1.DateTime.fromISO(node.createdAt);
            let login = ((_a = node.actor) === null || _a === void 0 ? void 0 : _a.login) || ((_b = node.author) === null || _b === void 0 ? void 0 : _b.login);
            return { kind, datetime, login, node };
        });
        events.sort((a, b) => a.createdAt - b.createdAt);
        this._memoizeCache.set('timelineItemsAsc', events);
        return events;
    }
    // The PR is opened for review when:
    // - only counting events that occur after the *last* "reopened" event (if any):
    //   - last "ReadyForReview" event occurs (aka convert FROM draft to open)
    //   - OR: first ReviewRequested
    get openedForReviewAt() {
        if (this._memoizeCache.has('openedForReviewAt')) {
            return this._memoizeCache.get('openedForReviewAt');
        }
        let debug = this.debug.extend('openedForReviewAt');
        let eventsAsc = this.timelineItemsAsc;
        // If the PR was ever closed, only look at events *since* it was reopened
        let lastReopened = findLast(eventsAsc, ({ kind }) => kind === 'ReopenedEvent');
        if (lastReopened) {
            eventsAsc = eventsAsc.slice(eventsAsc.lastIndexOf(lastReopened));
        }
        // Last ReadyForReview
        let lastReadyForReview = findLast(eventsAsc, ({ kind }) => kind === 'ReadyForReviewEvent');
        let firstReviewRequested = eventsAsc.find(({ kind }) => kind === 'ReviewRequestedEvent');
        if (firstReviewRequested &&
            this.mergedAt &&
            firstReviewRequested.datetime > this.mergedAt) {
            debug(`firstReviewRequested was after mergedAt, ignoring (was: ${firstReviewRequested.datetime})`);
            firstReviewRequested = undefined;
        }
        let openedForReviewAt = undefined;
        if (lastReadyForReview) {
            debug(`found lastReadyForReview: ${lastReadyForReview.datetime}`);
            openedForReviewAt = lastReadyForReview.datetime;
        }
        else if (firstReviewRequested) {
            // If no ReadyForReview, this was never in Draft state
            // Find first "ReviewRequested" instead
            debug(`found firstReviewRequested: ${firstReviewRequested.datetime}`);
            openedForReviewAt = firstReviewRequested.datetime;
        }
        else {
            // Otherwise, this PR was opened up in non-draft-state
            if (lastReopened) {
                this.debug(`using lastReopened: ${lastReopened.datetime}`);
                openedForReviewAt = lastReopened.datetime;
            }
            else {
                this.debug(`defaulting to createdAt: ${this.createdAt}`);
                openedForReviewAt = this.createdAt;
            }
        }
        debug(`RETURN ${openedForReviewAt}`);
        this._memoizeCache.set('openedForReviewAt', openedForReviewAt);
        return openedForReviewAt;
    }
}
exports.PullRequest = PullRequest;
