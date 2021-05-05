import { Interval } from 'luxon';
import { githubGraphqlClient } from '../../utils/env';
import { mergedPullRequests } from '../../utils/graphql-queries';
import { loadPullRequest } from '../../models/pull-request';
import debugBase, { Debugger } from 'debug';
import percentiles from '../../utils/percentiles';

type MetricRow = {
  name: string;
  desc: string;
  formattedValue: string;
  value: any;
};

export default class TimeToMergeMetric {
  debug: Debugger;
  data?: MetricRow[];
  constructor(public interval: Interval) {
    this.debug = debugBase('metrics:time-to-merge');
  }

  get title(): string {
    return `Pull Request Time To Merge, PRs merged during ${this.interval.toISO()}`;
  }

  get summary(): string {
    if (!this.data) {
      throw new Error(`Cannot get summary before loading data`);
    }
    // let [p0, p50, p90, p100] = percentiles(
    //   [0, 50, 90, 100],
    //   this.data.map((row) => row.value);
    // );
    return '';
  }

  async fetchMergedPullRequestNumbers(): Promise<number[]> {
    let client = githubGraphqlClient();
    let data: any = await client(mergedPullRequests(this.interval));
    return data.search.nodes.map((node: any) => Number(node.number));
  }

  async run(): Promise<string> {
    let numbers = await this.fetchMergedPullRequestNumbers();
    this.debug(`found merged PR numbers: %o`, numbers);

    let data: MetricRow[] = [];

    for (let number of numbers) {
      let pr = await loadPullRequest(number);
      let ttM = pr.timeToMerge!;
      let formattedTTM = ttM.toFormat('dd:hh:mm:ss');
      data.push({
        desc: `PR #${pr.number}`,
        name: 'timeToMerge',
        value: ttM,
        formattedValue: formattedTTM,
      });
    }

    return `
     ## ${this.title} ##
     ${data
       .map((datum) => {
         return `${datum.desc}:\t${datum.formattedValue}`;
       })
       .join('\n')}
    `;
  }
}
