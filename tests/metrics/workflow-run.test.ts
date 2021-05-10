import { Interval, DateTime } from 'luxon';
import setupPolly from '../setup-polly';
import WorkflowDuration from '../../src/metrics/workflow-duration';
import { fetchWorkflowRuns } from '../../src/utils/api-requests';
import { percentiles } from '../../src/metric';

/**
 *  These tests rely on the source-of-run-data.yml Workflow Runs:
 *  https://github.com/bantic/github-metrics-tests/actions/workflows/source-of-run-data.yml
 * 
 *  To view the source data locally, install `gh` and `jq` and run:
    gh api -X GET /repos/bantic/github-metrics-tests/actions/workflows/source-of-run-data.yml/runs \
      -f 'status=success' | jq '.workflow_runs[] | {id, created_at, updated_at}'
 */

describe('metrics: WorkflowDuration', () => {
  setupPolly();

  const workflowId = 'source-of-run-data.yml';
  const start = DateTime.fromISO('2021-05-09T22:30:00Z').toUTC();
  const end = DateTime.fromISO('2021-05-10T13:40:00Z').toUTC();
  const interval = Interval.fromDateTimes(start, end);

  test('fetches workflow run durations', async () => {
    let metric = new WorkflowDuration(interval, workflowId);
    await metric.run();
    expect(metric.data.length).toBe(8);

    let [p0, p50, p90, p100] = percentiles([0, 50, 90, 100], metric);
    expect(p0).toBe(16000);
    expect(p50).toBe(61000);
    expect(p90).toBe(511000);
    expect(p100).toBe(511000);
  });

  test('fetchWorkflowRuns finds only successful runs', async () => {
    let { runs } = await fetchWorkflowRuns(interval, workflowId);
    expect(runs.length).toBe(8);

    for (let run of runs) {
      expect(run.conclusion).toBe('success');
    }
  });

  test('fetchWorkflowRuns finds only runs in the interval, paginates if needed', async () => {
    // This shorter interval omits the first and last successful
    // workflow runs
    let shortInterval = Interval.fromDateTimes(
      DateTime.fromISO('2021-05-09T23:31:00Z').toUTC(),
      DateTime.fromISO('2021-05-10T13:31:50Z').toUTC()
    );

    let { runs } = await fetchWorkflowRuns(shortInterval, workflowId);
    expect(runs.length).toBe(6);

    for (let run of runs) {
      expect(shortInterval.contains(run.createdAt)).toBe(true);
    }

    let paginatedResults = await fetchWorkflowRuns(
      shortInterval,
      workflowId,
      runs.length - 1
    );
    let { meta } = paginatedResults;

    expect(meta.total_pages).toBeGreaterThan(1);
    expect(paginatedResults.runs.length).toBe(runs.length);
  });
});
