import { Interval, DateTime } from 'luxon';
import setupPolly from '../setup-polly';
import WorkflowSuccess from '../../src/metrics/workflow/success';

/**
 *  These tests rely on the source-of-run-data.yml Workflow Runs:
 *  https://github.com/bantic/github-metrics-tests/actions/workflows/source-of-run-data.yml
 * 
 *  To view the source data locally, install `gh` and `jq` and run:
    gh api -X GET /repos/bantic/github-metrics-tests/actions/workflows/source-of-run-data.yml/runs \
      -f 'status=success' | jq '.workflow_runs[] | {status, conclusion}'
 */

describe('metrics: WorkflowSuccess', () => {
  setupPolly();

  const workflow = {
    id: 'source-of-run-data.yml',
    name: 'name does not matter to this test',
  };
  const start = DateTime.fromISO('2021-05-09T22:30:00Z');
  const end = DateTime.fromISO('2021-05-10T13:40:00Z');
  const interval = Interval.fromDateTimes(start, end);

  test('counts successful and total runs in the interval', async () => {
    let metric = new WorkflowSuccess(interval, workflow);
    await metric.run();
    expect(metric.data.length).toBe(11);
    expect(metric.summary[0]).toContain('8/11');
    expect(metric.summary[0]).toContain('72.7%');
  });
});
