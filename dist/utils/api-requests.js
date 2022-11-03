"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWorkflowRuns = exports.STATUS_COMPLETED = exports.STATUS_SUCCESS = exports.fetchWorkflows = void 0;
const env_1 = require("./env");
const luxon_1 = require("luxon");
const octokit_1 = require("./octokit");
const workflow_run_1 = require("../models/workflow-run");
const debug_1 = require("../utils/debug");
const MAX_PER_PAGE = 50;
async function fetchWorkflows() {
    const debug = debug_1.default.extend('api:fetch-workflows');
    let { repo, owner, token } = env_1.githubArgs();
    let client = new octokit_1.Octokit({ auth: token });
    let result = await client.actions.listRepoWorkflows({ repo, owner });
    let workflowData = result.data.workflows.map(({ id, name, path }) => ({
        id,
        name,
        path,
    }));
    debug(`Found ${result.data.workflows.length} workflows: %o`, workflowData);
    let total = result.data.total_count;
    if (total > workflowData.length) {
        console.warn(`Warning: not all workflows were found. Only found ${workflowData.length} out of ${total}`);
    }
    return workflowData;
}
exports.fetchWorkflows = fetchWorkflows;
const DEFAULT_FETCH_WORKFLOW_RUNS_OPTIONS = {
    per_page: MAX_PER_PAGE,
};
// Passing this status causes the API to only return workflow runs that
// are both `conclusion:success` *and* `status:completed`
exports.STATUS_SUCCESS = 'success';
// Passing this causes the API to return workflow runs that have completed,
// but may have a non-success status.
exports.STATUS_COMPLETED = 'completed';
async function fetchWorkflowRuns(interval, workflowId, options = {}) {
    const debug = debug_1.default.extend('api:fetch-workflow-runs:' + workflowId);
    let { repo, owner, token } = env_1.githubArgs();
    let client = new octokit_1.Octokit({ auth: token });
    options = {
        ...DEFAULT_FETCH_WORKFLOW_RUNS_OPTIONS,
        ...options,
    };
    // Note: There appears to be a bug in the GH API where sometimes valid results
    // are omitted when this parameter is passed, so we remove it from the API options
    // here. Instead, we fetch *all* workflow runs and post-filter them in memory to include
    // only those with a status or conclusion that matches this filter.
    // @see https://github.community/t/bug-when-filtering-workflow-runs-by-status-success-some-runs-are-omitted/190014/1
    let statusFilter = options.status;
    if (options.status) {
        delete options.status;
    }
    let runData = [];
    let didLogCount = false;
    let didLogFirstFound = false;
    let page = 0;
    debug(`beginning pagination loop`);
    try {
        paginationLoop: for await (const response of client.paginate.iterator(client.rest.actions.listWorkflowRuns, {
            repo,
            owner,
            workflow_id: workflowId,
            ...options,
        })) {
            if (!didLogCount) {
                didLogCount = true;
                debug(`found ${response.data.total_count} results`);
            }
            page++;
            if (response.data.length === 0) {
                debug(`exiting pagination because of a 0-length response`);
                break paginationLoop;
            }
            let first = luxon_1.DateTime.fromISO(response.data[0].created_at).toUTC();
            let last = luxon_1.DateTime.fromISO(response.data[response.data.length - 1].created_at).toUTC();
            debug(`page #${page} ${response.data.length} items from ${first} -> ${last}`);
            for (let workflowRunData of response.data) {
                let createdAt = luxon_1.DateTime.fromISO(workflowRunData.created_at);
                switch (true) {
                    case interval.contains(createdAt):
                        if (!didLogFirstFound) {
                            debug(`found first run in interval, keeping ${workflowRunData.id} because ${createdAt} is contained by ${interval}`);
                            didLogFirstFound = true;
                        }
                        runData.push(workflowRunData);
                        break;
                    case interval.isAfter(createdAt):
                        debug(`exiting pagination: workflow run ${workflowRunData.id} created at ${createdAt}, before the interval ${interval}`);
                        break paginationLoop;
                }
            }
        } // end of paginationLoop
    }
    catch (error) {
        debug(`unexpected error %o`, error);
        const emptyResponse = {
            runs: [],
            meta: { total_pages: 0 },
        };
        return emptyResponse;
    }
    if (statusFilter) {
        let total = runData.length;
        runData = runData.filter((data) => data.status === statusFilter || data.conclusion === statusFilter);
        debug(`Filtered result count by \`status="%o"\` from %o to %o`, statusFilter, total, runData.length);
    }
    let runs = runData.map((data) => new workflow_run_1.WorkflowRun(data));
    return {
        runs,
        meta: { total_pages: page },
    };
}
exports.fetchWorkflowRuns = fetchWorkflowRuns;
