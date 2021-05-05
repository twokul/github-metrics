import TimeToMergeMetric from '../../src/metrics/time-to-merge';
import setupPolly from '../setup-polly';
import { Interval, DateTime } from 'luxon';
import { percentiles } from '../../src/metric';

describe('metric: TimeToMerge', () => {
  setupPolly();

  test('value is correct for test repo', async () => {
    let start = DateTime.fromISO('2021-05-04T18:00:00Z');
    let end = DateTime.fromISO('2021-05-05T20:00:00Z');
    let interval = Interval.fromDateTimes(start, end);

    let metric = new TimeToMergeMetric(interval);
    await metric.run();

    expect(metric.data.length).toBe(3);

    let [p0, p50, p90, p100] = percentiles([0, 50, 90, 100], metric);

    expect(p0).toBe(46000);
    expect(p50).toBe(111000);
    expect(p90).toBe(168000);
    expect(p100).toBe(168000);
  });

  test('no problems for test repo when no merged PRs are found', async () => {
    let start = DateTime.fromISO('2021-05-04T18:00:00Z');
    let end = start.plus({ minutes: 1 });
    let interval = Interval.fromDateTimes(start, end);

    let metric = new TimeToMergeMetric(interval);
    await metric.run();

    expect(metric.data.length).toBe(0);
  });
});
