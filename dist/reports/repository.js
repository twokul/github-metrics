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
var _owner, _repo, _pullRequests;
Object.defineProperty(exports, "__esModule", { value: true });
const github_client_1 = require("../github-client");
const pull_request_1 = require("./pull-request");
class RepositoryReport {
    constructor({ owner, repo, pullRequests }) {
        _owner.set(this, void 0);
        _repo.set(this, void 0);
        _pullRequests.set(this, void 0);
        __classPrivateFieldSet(this, _owner, owner);
        __classPrivateFieldSet(this, _repo, repo);
        __classPrivateFieldSet(this, _pullRequests, pullRequests);
    }
    get name() {
        return `${__classPrivateFieldGet(this, _owner)}/${__classPrivateFieldGet(this, _repo)}`;
    }
    get openedPullRequests() {
        return __classPrivateFieldGet(this, _pullRequests).filter((pr) => pr.state === github_client_1.PullRequestState.OPENED);
    }
    get closedPullRequests() {
        return __classPrivateFieldGet(this, _pullRequests).filter((pr) => pr.state === github_client_1.PullRequestState.CLOSED);
    }
    get mergedPullRequests() {
        return __classPrivateFieldGet(this, _pullRequests).filter((pr) => pr.state === github_client_1.PullRequestState.MERGED);
    }
    get hotfixes() {
        const hotfixes = __classPrivateFieldGet(this, _pullRequests).map((pr) => new pull_request_1.default(pr)).filter((pr) => pr.isHotfix);
        return hotfixes.length;
    }
    get averageTimeToMerge() {
        const totalTimeToMerge = __classPrivateFieldGet(this, _pullRequests).map((pullRequest) => {
            const analysis = new pull_request_1.default(pullRequest);
            return Number(analysis.timeToMerge.toFormat('h'));
        })
            .reduce((sum, value) => (sum += value), 0);
        return totalTimeToMerge / __classPrivateFieldGet(this, _pullRequests).length;
    }
    get aggregatedReviewDepth() {
        const reviewDepth = {
            comments: 0,
            reviews: 0,
            reviewers: 0,
        };
        __classPrivateFieldGet(this, _pullRequests).map((pullRequest) => {
            const analysis = new pull_request_1.default(pullRequest);
            return analysis.reviewDepth;
        })
            .forEach((analysis) => {
            reviewDepth.comments + analysis.comments;
            reviewDepth.reviewers += analysis.reviewers;
            reviewDepth.reviews += analysis.reviews;
        });
        return reviewDepth;
    }
    get averageIdleTime() {
        const totalIdleTime = __classPrivateFieldGet(this, _pullRequests).map((pullRequest) => {
            const analysis = new pull_request_1.default(pullRequest);
            return Number(analysis.idleTime.toFormat('h'));
        })
            .reduce((sum, value) => (sum += value), 0);
        return totalIdleTime / __classPrivateFieldGet(this, _pullRequests).length;
    }
}
exports.default = RepositoryReport;
_owner = new WeakMap(), _repo = new WeakMap(), _pullRequests = new WeakMap();
