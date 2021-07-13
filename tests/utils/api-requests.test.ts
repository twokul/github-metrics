import { Interval, DateTime } from 'luxon';
import setupPolly from '../setup-polly';
import {
  fetchWorkflowRuns,
  fetchWorkflows,
  STATUS_SUCCESS,
} from '../../src/utils/api-requests';

describe('api-requests', () => {
  setupPolly();

  /**
   * Source data from https://github.com/bantic/github-metrics-tests/actions
   * View source data locally using `gh` and `jq`:

    gh api /repos/bantic/github-metrics-tests/actions/workflows \
      | jq '.workflows[] | {id,name}'
   */
  describe('fetchWorkflows', () => {
    test('finds all workflow ids and names', async () => {
      let workflows = await fetchWorkflows();

      expect(workflows.length).toBe(1);

      let ids = workflows.map(({ id }) => id);
      let names = workflows.map(({ name }) => name);

      expect(ids).toStrictEqual([8907563]);
      expect(names).toStrictEqual(['Workflow Runs Create Test Data']);
    });
  });

  /**
   *  These tests rely on the source-of-run-data.yml Workflow Runs:
   *  https://github.com/bantic/github-metrics-tests/actions/workflows/source-of-run-data.yml
   * 
   *  To view the source data locally, install `gh` and `jq` and run:
      gh api -X GET /repos/bantic/github-metrics-tests/actions/workflows/source-of-run-data.yml/runs \
        -f 'status=success' | jq '.workflow_runs[] | {id, created_at, updated_at}'
   */

  describe('fetchWorkflowRuns', () => {
    const workflowId = 'source-of-run-data.yml';
    const start = DateTime.fromISO('2021-05-09T22:30:00Z');
    const end = DateTime.fromISO('2021-05-10T13:40:00Z');

    // This interval includes workflow runs number 1 through 11 inclusive,
    // @see https://github.com/bantic/github-metrics-tests/actions/workflows/source-of-run-data.yml
    const interval = Interval.fromDateTimes(start, end);

    test('finds all runs when no status is specified', async () => {
      // To view JSON API reponse run:
      //   gh api -X GET /repos/bantic/github-metrics-tests/actions/workflows/source-of-run-data.yml/runs
      let { runs } = await fetchWorkflowRuns(interval, workflowId);
      expect(runs.length).toBe(11);

      expect(runs.filter((run) => run.conclusion === 'success').length).toBe(8);
      expect(runs.filter((run) => run.conclusion === 'failure').length).toBe(2);
      expect(runs.filter((run) => run.conclusion === 'cancelled').length).toBe(
        1
      );
      expect(runs.filter((run) => run.status === 'completed').length).toBe(11);
    });

    test('finds only successful runs when status=success', async () => {
      let { runs } = await fetchWorkflowRuns(interval, workflowId, {
        status: STATUS_SUCCESS,
      });
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

      let results = await fetchWorkflowRuns(shortInterval, workflowId, {
        status: STATUS_SUCCESS,
      });
      let { runs } = results;
      expect(runs.length).toBe(6);

      for (let run of runs) {
        expect(shortInterval.contains(run.createdAt)).toBe(true);
      }

      let paginatedResults = await fetchWorkflowRuns(
        shortInterval,
        workflowId,
        { per_page: runs.length - 1, status: STATUS_SUCCESS }
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
        { per_page: 1, status: STATUS_SUCCESS }
      );

      expect(meta.total_pages).toBe(2);
      expect(runs.length).toBe(1);
      expect(runs[0].id).toBe(results.runs[0].id);
    });
  });
});
