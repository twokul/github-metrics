import { githubArgs } from './env';
import { Interval, DateTime } from 'luxon';
import { Octokit } from '@octokit/rest';
import {
  WorkflowRun,
  WorkflowRunData,
  STATUS_TYPE,
  CONCLUSION_TYPE,
} from '../models/workflow-run';
import debugBase from '../utils/debug';

const MAX_PER_PAGE = 100;

type WorkflowRunResults = {
  runs: WorkflowRun[];
  meta: { total_pages: number };
};

export type WorkflowData = {
  id: string | number;
  name: string;
};

export async function fetchWorkflows(): Promise<WorkflowData[]> {
  const debug = debugBase.extend('api:fetch-workflows');
  let { repo, owner, token } = githubArgs();
  let client = new Octokit({ auth: token });
  let result = await client.actions.listRepoWorkflows({ repo, owner });

  let workflowData = result.data.workflows.map(({ id, name }) => ({
    id,
    name,
  }));
  debug(`Found ${result.data.workflows.length} workflows: %o`, workflowData);

  let total = result.data.total_count;
  if (total > workflowData.length) {
    console.warn(
      `Warning: not all workflows were found. Only found ${workflowData.length} out of ${total}`
    );
  }

  return workflowData;
}

export type FetchWorkflowRunsOptions = {
  per_page?: number;
  status?: STATUS_QUERY_TYPE;
  branch?: string;
};

const DEFAULT_FETCH_WORKFLOW_RUNS_OPTIONS = {
  per_page: MAX_PER_PAGE,
};

// @see https://docs.github.com/en/rest/reference/actions#list-workflow-runs
// When listing workflow runs, the "status" field does double duty with the GH API.
// It can be used to specify runs where the `status` *or* `conclusion` field
// matches the passed parameter.
type STATUS_QUERY_TYPE = STATUS_TYPE | CONCLUSION_TYPE;

// Passing this status causes the API to only return workflow runs that
// are both `conclusion:success` *and* `status:completed`
export const STATUS_SUCCESS: STATUS_QUERY_TYPE = 'success';

// Passing this causes the API to return workflow runs that have completed,
// but may have a non-success status.
export const STATUS_COMPLETED: STATUS_QUERY_TYPE = 'completed';

export async function fetchWorkflowRuns(
  interval: Interval,
  workflowId: number | string,
  options: FetchWorkflowRunsOptions = {}
): Promise<WorkflowRunResults> {
  const debug = debugBase.extend('api:fetch-workflow-runs:' + workflowId);
  let { repo, owner, token } = githubArgs();
  let client = new Octokit({ auth: token });
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

  paginationLoop: for await (const response of client.paginate.iterator(
    client.rest.actions.listWorkflowRuns,
    {
      repo,
      owner,
      workflow_id: workflowId,
      ...options,
    }
  )) {
    if (!didLogCount) {
      didLogCount = true;
      debug(`found ${response.data.total_count} results`);
    }
    page++;

    if (response.data.length === 0) {
      debug(`exiting pagination because of a 0-length response`);
      break paginationLoop;
    }

    let first = DateTime.fromISO(response.data[0].created_at).toUTC();
    let last = DateTime.fromISO(
      response.data[response.data.length - 1].created_at
    ).toUTC();

    debug(
      `page #${page} ${response.data.length} items from ${first} -> ${last}`
    );

    for (let workflowRunData of response.data) {
      let createdAt = DateTime.fromISO(workflowRunData.created_at);

      switch (true) {
        case interval.contains(createdAt):
          if (!didLogFirstFound) {
            debug(
              `found first run in interval, keeping ${workflowRunData.id} because ${createdAt} is contained by ${interval}`
            );
            didLogFirstFound = true;
          }
          runData.push(workflowRunData);
          break;
        case interval.isAfter(createdAt):
          debug(
            `exiting pagination: workflow run ${workflowRunData.id} created at ${createdAt}, before the interval ${interval}`
          );
          break paginationLoop;
      }
    }
  } // end of paginationLoop

  if (statusFilter) {
    let total = runData.length;
    runData = runData.filter(
      (data) => data.status === statusFilter || data.conclusion === statusFilter
    );
    debug(
      `Filtered result count by \`status="${statusFilter}"\` from ${total} to ${runData.length}`
    );
  }
  let runs = runData.map((data) => new WorkflowRun(data as WorkflowRunData));

  return {
    runs,
    meta: { total_pages: page },
  };
}
