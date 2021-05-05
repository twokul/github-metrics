import { Duration, Interval } from 'luxon';
import { fetchMergedPullRequestNumbers } from '../utils/graphql-queries';
import { loadPullRequest } from '../models/pull-request';
import debugBase, { Debugger } from 'debug';
import durationToHuman from '../utils/duration-to-human';
import { Metric, MetricData, percentiles } from '../metric';

export default class TimeToMergeMetric implements Metric {
  debug: Debugger;
  data: MetricData[];
  name = 'Pull Request Time-To-Merge';
  constructor(public interval: Interval) {
    this.debug = debugBase('metrics:time-to-merge');
    this.data = [];
  }

  get summary(): string {
    let values = this.data.map((row) => row.value);
    if (values.length === 0) {
      return `No data`;
    }

    let [p0, p50, p90, p100] = percentiles([0, 50, 90, 100], this);
    let toFormatted = (pValue: number): string => {
      let duration = Duration.fromMillis(pValue);
      return durationToHuman(duration);
    };

    return `p0: ${toFormatted(p0)}; p50: ${toFormatted(
      p50
    )}; p90: ${toFormatted(p90)}; p100: ${toFormatted(p100)}`;
  }

  async run(): Promise<void> {
    let numbers = await fetchMergedPullRequestNumbers(this.interval);
    this.debug(`found merged PR numbers: %o`, numbers);

    let data: MetricData[] = [];

    for (let number of numbers) {
      let pr = await loadPullRequest(number);
      let ttM = (pr.timeToMerge as Duration).toMillis();
      data.push({ value: ttM });
    }

    this.data = data;
  }
}
