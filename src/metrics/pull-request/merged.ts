import { Interval } from 'luxon';
import { fetchMergedPullRequestNumbers } from '../../utils/graphql-queries';
import debug, { Debugger } from '../../utils/debug';
import { NumericMetric, NumericMetricData } from '../../metric';
import { pluralize } from '../../utils/pluralize';

export default class MergedPRsMetric implements NumericMetric {
  debug: Debugger;
  data: NumericMetricData[];
  didRun: boolean = false;
  name = 'Merged Pull Requests';
  constructor(public interval: Interval) {
    this.debug = debug.extend('metrics:merged-prs');
    this.data = [];
  }

  get hasData() {
    if (!this.didRun) {
      throw new Error(`Must call run() first`);
    }
    return this.data.length > 0;
  }

  get summary() {
    if (!this.didRun) {
      throw new Error(`Must run metric before accessing data`);
    }
    return [pluralize('%d Merged Pull Request', this.data.length)];
  }

  async run(): Promise<void> {
    let numbers = await fetchMergedPullRequestNumbers(this.interval);
    this.debug(`found merged PR numbers: %o`, numbers);

    this.data = numbers.map((number) => ({ value: number }));
    this.didRun = true;
  }
}
