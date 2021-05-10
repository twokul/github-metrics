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
  const start = DateTime.fromISO('2021-05-09T22:30:00Z');
  const end = DateTime.fromISO('2021-05-10T13:40:00Z');
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

  describe('api-requests:fetchWorkflowRuns', () => {
    test('finds only successful runs', async () => {
      let { runs } = await fetchWorkflowRuns(interval, workflowId);
      expect(runs.length).toBe(8);

      for (let run of runs) {
        expect(run.conclusion).toBe('success');
      }
    });

    test('finds only runs in the interval, paginates if needed', async () => {
      // This shorter interval omits the first and last successful
      // workflow runs
      let shortInterval = Interval.fromDateTimes(
        DateTime.fromISO('2021-05-09T23:31:00Z'),
        DateTime.fromISO('2021-05-10T13:31:50Z')
      );

      let results = await fetchWorkflowRuns(shortInterval, workflowId);
      let { runs } = results;
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

      expect(meta.total_pages).toBeGreaterThan(results.meta.total_pages);
      expect(paginatedResults.runs.length).toBe(runs.length);
    });

    test('fetchWorkflowRuns exits pagination when it finds results before the interval', async () => {
      let results = await fetchWorkflowRuns(interval, workflowId);

      let latestRun = results.runs[0];

      let soloRunInterval = Interval.fromDateTimes(
        latestRun.createdAt.minus({ seconds: 1 }),
        latestRun.createdAt.plus({ seconds: 1 })
      );

      let { runs, meta } = await fetchWorkflowRuns(
        soloRunInterval,
        workflowId,
        1
      );

      expect(meta.total_pages).toBe(2);
      expect(runs.length).toBe(1);
      expect(runs[0].id).toBe(results.runs[0].id);
    });
  });
});
