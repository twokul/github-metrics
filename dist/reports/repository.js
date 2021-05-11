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
var _owner, _repo, _pullRequests, _startDate, _endDate;
Object.defineProperty(exports, "__esModule", { value: true });
const github_client_1 = require("../github-client");
const pull_request_1 = require("./pull-request");
class RepositoryReport {
    constructor({ owner, repo, pullRequests, startDate, endDate, }) {
        _owner.set(this, void 0);
        _repo.set(this, void 0);
        _pullRequests.set(this, void 0);
        _startDate.set(this, void 0);
        _endDate.set(this, void 0);
        __classPrivateFieldSet(this, _owner, owner);
        __classPrivateFieldSet(this, _repo, repo);
        __classPrivateFieldSet(this, _pullRequests, pullRequests);
        __classPrivateFieldSet(this, _startDate, startDate);
        __classPrivateFieldSet(this, _endDate, endDate);
    }
    /**
     * The name of the report.
     */
    get name() {
        return `${__classPrivateFieldGet(this, _owner)}/${__classPrivateFieldGet(this, _repo)}`;
    }
    /**
     * Link to the Github Pull Request page with all pull requests listed in the
     * report between start and end date.
     */
    get url() {
        return `https://github.com/${__classPrivateFieldGet(this, _owner)}/${__classPrivateFieldGet(this, _repo)}/pulls?q=created:${__classPrivateFieldGet(this, _startDate)}..${__classPrivateFieldGet(this, _endDate)}`;
    }
    /**
     * The start date of the report.
     */
    get startDate() {
        return __classPrivateFieldGet(this, _startDate);
    }
    /**
     * The end date of the report.
     */
    get endDate() {
        return __classPrivateFieldGet(this, _endDate);
    }
    /**
     * The number of opened pull requests.
     */
    get openedPullRequests() {
        return __classPrivateFieldGet(this, _pullRequests).filter((pr) => pr.state === github_client_1.PullRequestState.OPENED);
    }
    /**
     * The number of closed pull requests.
     */
    get closedPullRequests() {
        return __classPrivateFieldGet(this, _pullRequests).filter((pr) => pr.state === github_client_1.PullRequestState.CLOSED);
    }
    /**
     * The number of opened and merged pull requests.
     */
    get mergedAndOpened() {
        return __classPrivateFieldGet(this, _pullRequests).filter((pullRequest) => pullRequest.state != github_client_1.PullRequestState.CLOSED);
    }
    /**
     * The number of pull requests against `release/*` branch.
     */
    get hotfixes() {
        const hotfixes = __classPrivateFieldGet(this, _pullRequests).map((pr) => new pull_request_1.default(pr))
            .filter((pr) => pr.isHotfix);
        return hotfixes.length;
    }
    /**
     * Calculates the average review depth for all pull requests.
     *
     * This includes:
     * - number of comments
     * - number of reviews
     * - number of reviewers
     */
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
    /**
     * Calculates the average idle time for the merged or opened pull requests.
     *
     * Idle time is the amount of time elapsed from "pull request created" to
     * "first review submitted".
     */
    get averageIdleTime() {
        if (__classPrivateFieldGet(this, _pullRequests).length === 0) {
            return 0;
        }
        const totalIdleTime = this.mergedAndOpened
            .map((pullRequest) => {
            const analysis = new pull_request_1.default(pullRequest);
            return Number(analysis.idleTime.toFormat('h'));
        })
            .reduce((sum, value) => (sum += value), 0);
        return totalIdleTime / this.mergedAndOpened.length;
    }
}
exports.default = RepositoryReport;
_owner = new WeakMap(), _repo = new WeakMap(), _pullRequests = new WeakMap(), _startDate = new WeakMap(), _endDate = new WeakMap();
