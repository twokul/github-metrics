"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_requests_1 = require("../../utils/api-requests");
const debug_1 = require("../../utils/debug");
const duration_to_human_1 = require("../../utils/duration-to-human");
const metric_1 = require("../../metric");
const pluralize_1 = require("../../utils/pluralize");
class WorkflowDurationMetric {
    constructor(interval, workflowData) {
        this.interval = interval;
        this.workflowData = workflowData;
        this.didRun = false;
        this.debug = debug_1.default.extend('metrics:workflow-duration:' + this.workflowData.id);
        this.data = [];
    }
    get name() {
        return `Workflow Duration for: "${this.workflowData.name}" (id ${this.workflowData.id})`;
    }
    get hasData() {
        if (!this.didRun) {
            throw new Error(`Must call run() first`);
        }
        return this.data.length > 0;
    }
    get summary() {
        if (!this.didRun) {
            throw new Error(`Cannot get summary before callling run()`);
        }
        if (this.data.length === 0) {
            return ['No data'];
        }
        let [p0, p50, p90, p100] = metric_1.percentiles([0, 50, 90, 100], this);
        return [
            pluralize_1.pluralize('%d Successful run', this.data.length),
            `p0 ${duration_to_human_1.millisToHuman(p0)}`,
            `p50 ${duration_to_human_1.millisToHuman(p50)}`,
            `p90 ${duration_to_human_1.millisToHuman(p90)}`,
            `p100 ${duration_to_human_1.millisToHuman(p100)}`,
        ];
    }
    async run() {
        let { runs } = await api_requests_1.fetchWorkflowRuns(this.interval, this.workflowData.id, { status: api_requests_1.STATUS_SUCCESS });
        this.debug(`found %o workflow runs for %o`, runs.length, this.workflowData);
        let data = [];
        runs.forEach((run) => {
            this.debug(`run #${run.id} duration: ${duration_to_human_1.durationToHuman(run.duration)}`);
            data.push({ value: run.duration.toMillis() });
        });
        this.didRun = true;
        this.data = data;
    }
}
exports.default = WorkflowDurationMetric;
