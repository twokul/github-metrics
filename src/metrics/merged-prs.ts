import { Interval } from 'luxon';
import { fetchMergedPullRequestNumbers } from '../utils/graphql-queries';
import debug, { Debugger } from '../utils/debug';
import { Metric, MetricData } from '../metric';
import { pluralize } from '../utils/pluralize';

export default class MergedPRsMetric implements Metric {
  debug: Debugger;
  data: MetricData[];
  didRun: boolean = false;
  name = 'Merged Pull Requests';
  constructor(public interval: Interval) {
    this.debug = debug.extend('metrics:merged-prs');
    this.data = [];
  }

  get summary(): string {
    if (!this.didRun) {
      throw new Error(`Must run metric before accessing data`);
    }
    let count = this.data.length;
    return `${count} merged pull ${pluralize('request', count)}`;
  }

  async run(): Promise<void> {
    let numbers = await fetchMergedPullRequestNumbers(this.interval);
    this.debug(`found merged PR numbers: %o`, numbers);

    let data: MetricData[] = numbers.map((number) => ({ value: number }));
    this.data = data;
    this.didRun = true;
  }
}
