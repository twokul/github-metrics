import setupPolly from '../setup-polly';
import { Interval, DateTime } from 'luxon';
import MergedPRsMetric from '../../src/metrics/merged-prs';

describe('metric: MergedPRsMetric', () => {
  setupPolly();

  test('value is correct for test repo', async () => {
    let start = DateTime.fromISO('2021-05-04T18:00:00Z').toUTC();
    let end = DateTime.fromISO('2021-05-05T20:00:00Z').toUTC();
    let interval = Interval.fromDateTimes(start, end);

    let metric = new MergedPRsMetric(interval);
    await metric.run();

    expect(metric.data.length).toBe(3);
  });

  test('no problems for test repo when no merged PRs are found', async () => {
    let start = DateTime.fromISO('2021-05-04T18:00:00Z').toUTC();
    let end = start.plus({ minutes: 1 });
    let interval = Interval.fromDateTimes(start, end);

    let metric = new MergedPRsMetric(interval);
    await metric.run();

    expect(metric.data.length).toBe(0);
  });
});
