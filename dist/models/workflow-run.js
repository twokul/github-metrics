"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRun = void 0;
const luxon_1 = require("luxon");
const debug_1 = require("../utils/debug");
class WorkflowRun {
    constructor(data) {
        this.data = data;
        this.createdAt = luxon_1.DateTime.fromISO(data.created_at);
        this.updatedAt = luxon_1.DateTime.fromISO(data.updated_at);
        this.checkSuiteId = data.check_suite_id;
        this.workflowId = data.workflow_id;
        this.status = data.status;
        this.conclusion = data.conclusion;
        this.id = data.id;
        this.debug = debug_1.default.extend('workflow-run:' + this.id);
    }
    get duration() {
        return this.updatedAt.diff(this.createdAt);
    }
}
exports.WorkflowRun = WorkflowRun;
