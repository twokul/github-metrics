"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _pullRequest;
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
class PullRequestAnalysis {
    constructor(pullRequest) {
        _pullRequest.set(this, void 0);
        __classPrivateFieldSet(this, _pullRequest, pullRequest);
    }
    get title() {
        return __classPrivateFieldGet(this, _pullRequest).title;
    }
    get pullRequestNumber() {
        return __classPrivateFieldGet(this, _pullRequest).number;
    }
    get idleTime() {
        const createdAt = __classPrivateFieldGet(this, _pullRequest).createdAt;
        const submittedAt = __classPrivateFieldGet(this, _pullRequest).reviews.length === 0 ? luxon_1.DateTime.now().toString() : __classPrivateFieldGet(this, _pullRequest).reviews[0].submittedAt;
        const createdAtDateTime = luxon_1.DateTime.fromISO(createdAt);
        const submittedAtDateTime = luxon_1.DateTime.fromISO(submittedAt);
        return submittedAtDateTime.diff(createdAtDateTime);
    }
    get isHotfix() {
        return __classPrivateFieldGet(this, _pullRequest).baseRefName.startsWith('release/');
    }
    get timeToMerge() {
        const createdAt = __classPrivateFieldGet(this, _pullRequest).createdAt;
        const mergedAt = __classPrivateFieldGet(this, _pullRequest).mergedAt;
        const createdAtDateTime = luxon_1.DateTime.fromISO(createdAt);
        const mergedAtDateTime = mergedAt ? luxon_1.DateTime.fromISO(mergedAt) : luxon_1.DateTime.now();
        return mergedAtDateTime.diff(createdAtDateTime);
    }
    get reviewDepth() {
        const reviewers = new Set();
        __classPrivateFieldGet(this, _pullRequest).comments.forEach((comment) => reviewers.add(comment.author));
        __classPrivateFieldGet(this, _pullRequest).reviews.forEach((pullRequestReview) => reviewers.add(pullRequestReview.author));
        return {
            comments: __classPrivateFieldGet(this, _pullRequest).comments.length,
            reviewers: reviewers.size,
            reviews: __classPrivateFieldGet(this, _pullRequest).reviews.length,
        };
    }
}
exports.default = PullRequestAnalysis;
_pullRequest = new WeakMap();
