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
    async generateReport({ owner, repo, interval, }) {
        const pullRequests = await __classPrivateFieldGet(this, _githubClient).getPullRequestsByPeriod({
            owner,
            repo,
            startDate: interval.start.toString(),
            endDate: interval.end.toString(),
        });
        return new repository_1.default({
            pullRequests,
            owner,
            repo,
            startDate: interval.start.toISODate(),
            endDate: interval.end.toISODate(),
        });
    }
    async generateDailyReport({ owner, repo, }) {
        return this.generateReport({
            owner,
            repo,
            interval: date_1.getInterval(date_1.Period.DAY),
        });
    }
    async generateWeeklyReport({ owner, repo, }) {
        return this.generateReport({
            owner,
            repo,
            interval: date_1.getInterval(date_1.Period.WEEK),
        });
    }
}
exports.default = GithubMetrics;
_githubClient = new WeakMap();
