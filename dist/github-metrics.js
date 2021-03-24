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
var _githubClient;
Object.defineProperty(exports, "__esModule", { value: true });
const github_client_1 = require("./github-client");
const repository_1 = require("./reports/repository");
const date_1 = require("./utils/date");
class GithubMetrics {
    constructor({ token }) {
        _githubClient.set(this, void 0);
        __classPrivateFieldSet(this, _githubClient, new github_client_1.default({ token }));
    }
    async generateDailyReport({ owner, repo, }) {
        const { startDate, endDate } = date_1.generateDateRange();
        const pullRequests = await __classPrivateFieldGet(this, _githubClient).getPullRequestsByPeriod({
            owner,
            repo,
            startDate: startDate.toString(),
            endDate: endDate.toString(),
        });
        return new repository_1.default({
            pullRequests,
            owner,
            repo,
            startDate: startDate.toISODate(),
            endDate: endDate.toISODate(),
        });
    }
    async generateWeeklyReport({ owner, repo, }) {
        const { startDate, endDate } = date_1.generateDateRange(date_1.Period.WEEK);
        const pullRequests = await __classPrivateFieldGet(this, _githubClient).getPullRequestsByPeriod({
            owner,
            repo,
            startDate: startDate.toString(),
            endDate: endDate.toString(),
        });
        return new repository_1.default({
            pullRequests,
            owner,
            repo,
            startDate: startDate.toISODate(),
            endDate: endDate.toISODate(),
        });
    }
}
exports.default = GithubMetrics;
_githubClient = new WeakMap();
