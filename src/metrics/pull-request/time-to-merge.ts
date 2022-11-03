import { Duration, Interval } from 'luxon';
import { fetchMergedPullRequestNumbers } from '../../utils/graphql-queries';
import { loadPullRequest } from '../../models/pull-request';
import debug, { Debugger } from '../../utils/debug';
import { millisToHuman } from '../../utils/duration-to-human';
import { NumericMetric, NumericMetricData, percentiles } from '../../metric';

export default class TimeToMergeMetric implements NumericMetric {
  debug: Debugger;
  data: NumericMetricData[];
  didRun = false;
  name = 'Pull Request Time-To-Merge';
  constructor(public interval: Interval) {
    this.debug = debug.extend('metrics:time-to-merge');
    this.data = [];
  }

  get hasData() {
    if (!this.didRun) {
      throw new Error(`Must call run() first`);
    }
    return this.data.length > 0;
  }

  get summary() {
    let values = this.data.map((row) => row.value);
    if (values.length === 0) {
      return ['No data'];
    }

    let [p0, p50, p90, p100] = percentiles([0, 50, 90, 100], this);
    return [
      `p0 ${millisToHuman(p0)}`,
      `p50 ${millisToHuman(p50)}`,
      `p90 ${millisToHuman(p90)}`,
      `p100 ${millisToHuman(p100)}`,
    ];
  }

  async run(): Promise<void> {
    this.didRun = true;
    let numbers = await fetchMergedPullRequestNumbers(this.interval);
    this.debug(`found merged PR numbers: %o`, numbers);

    let data = [];

    for (let number of numbers) {
      let pr = await loadPullRequest(number);
      let ttM = (pr.timeToMerge as Duration).toMillis();
      data.push({ value: ttM });
    }

    this.data = data;
  }
}
