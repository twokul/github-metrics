import { githubArgs } from './env';
import { Interval, DateTime } from 'luxon';
import { Octokit } from '@octokit/rest';
import { WorkflowRun } from '../models/workflow-run';
import debugBase from '../utils/debug';

export async function fetchWorkflowRuns(
  interval: Interval,
  workflowId: number | string
): Promise<WorkflowRun[]> {
  const debug = debugBase.extend('api:fetch-workflow-runs:' + workflowId);
  let { repo, owner, token } = githubArgs();
  let client = new Octokit({ auth: token });

  let runs = [];
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
      per_page: 100,
    }
  )) {
    debugger;
    if (!didLogCount) {
      didLogCount = true;
      debug(`found ${response.data.total_count} results`);
    }
    page++;

    let latest = DateTime.fromISO(response.data[0].created_at);
    let earliest = DateTime.fromISO(
      response.data[response.data.length - 1].created_at
    );

    debug(
      `page #${page} ${response.data.length} items from ${earliest} -> ${latest}`
    );

    let exitLoop = false;
    for (let workflowRunData of response.data) {
      let createdAt = DateTime.fromISO(workflowRunData.created_at);
      if (interval.isBefore(createdAt)) {
        continue;
      } else if (interval.contains(createdAt)) {
        runs.push(workflowRunData);
      } else if (interval.isAfter(createdAt)) {
        debug(
          `workflow run found that was created at ${createdAt}, before the interval, exiting pagination`
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

  return runs.map((data) => new WorkflowRun(data));
}
