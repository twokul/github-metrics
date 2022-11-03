"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_queries_1 = require("../../utils/graphql-queries");
const pull_request_1 = require("../../models/pull-request");
const debug_1 = require("../../utils/debug");
const duration_to_human_1 = require("../../utils/duration-to-human");
const metric_1 = require("../../metric");
class TimeToMergeMetric {
    constructor(interval) {
        this.interval = interval;
        this.didRun = false;
        this.name = 'Pull Request Time-To-Merge';
        this.debug = debug_1.default.extend('metrics:time-to-merge');
        this.data = [];
    }
    get hasData() {
        if (!this.didRun) {
            throw new Error(`Must call run() first`);
        }
        return this.data.length > 0;
    }
    get summary() {
        let values = this.data.map((row) => row.value);
        if (values.length === 0) {
            return ['No data'];
        }
        let [p0, p50, p90, p100] = metric_1.percentiles([0, 50, 90, 100], this);
        return [
            `p0 ${duration_to_human_1.millisToHuman(p0)}`,
            `p50 ${duration_to_human_1.millisToHuman(p50)}`,
            `p90 ${duration_to_human_1.millisToHuman(p90)}`,
            `p100 ${duration_to_human_1.millisToHuman(p100)}`,
        ];
    }
    async run() {
        this.didRun = true;
        let numbers = await graphql_queries_1.fetchMergedPullRequestNumbers(this.interval);
        this.debug(`found merged PR numbers: %o`, numbers);
        let data = [];
        for (let number of numbers) {
            let pr = await pull_request_1.loadPullRequest(number);
            let ttM = pr.timeToMerge.toMillis();
            data.push({ value: ttM });
        }
        this.data = data;
    }
}
exports.default = TimeToMergeMetric;
