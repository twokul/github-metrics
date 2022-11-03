"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_queries_1 = require("../../utils/graphql-queries");
const debug_1 = require("../../utils/debug");
const pluralize_1 = require("../../utils/pluralize");
class MergedPRsMetric {
    constructor(interval) {
        this.interval = interval;
        this.didRun = false;
        this.name = 'Merged Pull Requests';
        this.debug = debug_1.default.extend('metrics:merged-prs');
        this.data = [];
    }
    get hasData() {
        if (!this.didRun) {
            throw new Error(`Must call run() first`);
        }
        return this.data.length > 0;
    }
    get summary() {
        if (!this.didRun) {
            throw new Error(`Must run metric before accessing data`);
        }
        return [pluralize_1.pluralize('%d Merged Pull Request', this.data.length)];
    }
    async run() {
        let numbers = await graphql_queries_1.fetchMergedPullRequestNumbers(this.interval);
        this.debug(`found merged PR numbers: %o`, numbers);
        this.data = numbers.map((number) => ({ value: number }));
        this.didRun = true;
    }
}
exports.default = MergedPRsMetric;
