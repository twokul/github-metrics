import { Interval, DateTime } from 'luxon';
import setupPolly from '../setup-polly';
import WorkflowDuration from '../../src/metrics/workflow-duration';
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

  const workflow = {
    id: 'source-of-run-data.yml',
    name: 'name does not matter to this test',
  };
  const start = DateTime.fromISO('2021-05-09T22:30:00Z');
  const end = DateTime.fromISO('2021-05-10T13:40:00Z');
  const interval = Interval.fromDateTimes(start, end);

  test('fetches workflow run durations', async () => {
    let metric = new WorkflowDuration(interval, workflow);
    await metric.run();
    expect(metric.data.length).toBe(8);

    let [p0, p50, p90, p100] = percentiles([0, 50, 90, 100], metric);
    expect(p0).toBe(16000);
    expect(p50).toBe(61000);
    expect(p90).toBe(511000);
    expect(p100).toBe(511000);
  });
});
