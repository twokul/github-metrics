"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_requests_1 = require("../../utils/api-requests");
const debug_1 = require("../../utils/debug");
class WorkflowSuccessMetric {
    constructor(interval, workflowData, workflowRunOptions) {
        this.interval = interval;
        this.workflowData = workflowData;
        this.workflowRunOptions = workflowRunOptions;
        this.data = [];
        this.didRun = false;
        this.debug = debug_1.default.extend('metrics:workflow-run-success');
    }
    get name() {
        return `Workflow Success Rate for "${this.workflowData.name}" (id ${this.workflowData.id})`;
    }
    get hasData() {
        if (!this.didRun) {
            throw new Error(`Must call run() first`);
        }
        return this.data.length > 0;
    }
    get summary() {
        if (!this.didRun) {
            throw new Error(`Cannot get sumary before calling run()`);
        }
        if (this.data.length === 0) {
            return [`No completed runs found.`];
        }
        let success = this.data.filter((d) => d.conclusion === 'success').length;
        let total = this.data.length;
        let percent = (100 * (success / total)).toFixed(1);
        this.debug(`Found ${this.data.length} total runs`);
        this.debug(`Non-success runs: ${JSON.stringify(this.data.filter((d) => d.conclusion !== 'success'))}`);
        return [`${percent}% Succeeded (${success}/${total})`];
    }
    async run() {
        await this.load();
        this.didRun = true;
    }
    async load() {
        let options = {
            ...this.workflowRunOptions,
            status: api_requests_1.STATUS_COMPLETED,
        };
        let { runs } = await api_requests_1.fetchWorkflowRuns(this.interval, this.workflowData.id, options);
        this.debug(`Found ${runs.length} workflow runs for ${this.workflowData}`);
        this.data = runs.map(({ status, conclusion }) => ({ status, conclusion }));
    }
}
exports.default = WorkflowSuccessMetric;
