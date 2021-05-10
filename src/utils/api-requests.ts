import { githubArgs } from './env';
import { Interval, DateTime } from 'luxon';
import { Octokit } from '@octokit/rest';
import { WorkflowRun } from '../models/workflow-run';
import debugBase from '../utils/debug';

const MAX_PER_PAGE = 100;

type WorkflowRunResults = {
  runs: WorkflowRun[];
  meta: { total_pages: number };
};

export async function fetchWorkflowRuns(
  interval: Interval,
  workflowId: number | string,
  per_page = MAX_PER_PAGE
): Promise<WorkflowRunResults> {
  const debug = debugBase.extend('api:fetch-workflow-runs:' + workflowId);
  let { repo, owner, token } = githubArgs();
  let client = new Octokit({ auth: token });

  let runData = [];
  const status = 'success';

  let didLogCount = false;
  let page = 0;

  for await (const response of client.paginate.iterator(
    client.rest.actions.listWorkflowRuns,
    {
      repo,
      owner,
      workflow_id: workflowId,
      status,
      per_page,
    }
  )) {
    if (!didLogCount) {
      didLogCount = true;
      debug(`found ${response.data.total_count} results`);
    }
    page++;

    let first = DateTime.fromISO(response.data[0].created_at).toUTC();
    let last = DateTime.fromISO(
      response.data[response.data.length - 1].created_at
    ).toUTC();

    debug(
      `page #${page} ${response.data.length} items from ${first} -> ${last}`
    );

    let exitLoop = false;
    for (let workflowRunData of response.data) {
      let createdAt = DateTime.fromISO(workflowRunData.created_at);
      if (interval.isBefore(createdAt)) {
        continue;
      } else if (interval.contains(createdAt)) {
        debug(
          `keeping run ${workflowRunData.id} because ${createdAt} is contained by ${interval}`
        );
        runData.push(workflowRunData);
      } else if (interval.isAfter(createdAt)) {
        debug(
          `exiting pagination: workflow run ${workflowRunData.id} created at ${createdAt}, before the interval ${interval}`
        );
        exitLoop = true;
        break;
      } else {
        throw new Error(
          `Unexpected workflowRunData not after, in or before interval: ${createdAt}, ${interval}`
        );
      }
    }
    if (exitLoop) {
      break;
    }
  }

  let runs = runData.map((data) => new WorkflowRun(data));

  return {
    runs,
    meta: { total_pages: page },
  };
}
