import { Interval } from 'luxon';
import { githubGraphqlClient } from '../../utils/env';
import { mergedPullRequests } from '../../utils/graphql-queries';
import { loadPullRequest } from '../../models/pull-request';
import debugBase, { Debugger } from 'debug';

type MetricRow = {
  name: string;
  desc: string;
  formattedValue: string;
  value: any;
};

export default class TimeToMergeMetric {
  debug: Debugger;
  constructor(public interval: Interval) {
    this.debug = debugBase('metrics:time-to-merge');
  }

  get title(): string {
    return `Pull Request Time To Merge, PRs merged during ${this.interval.toISO()}`;
  }

  async fetchMergedPullRequestNumbers(): Promise<number[]> {
    let client = githubGraphqlClient();
    let data: any = await client(mergedPullRequests(this.interval));
    return data.search.nodes.map((node: any) => Number(node.number));
  }

  async run(): Promise<string> {
    let numbers = await this.fetchMergedPullRequestNumbers();
    this.debug(`PR numbers: %o`, numbers);

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
         return `${datum.name}:\t${datum.formattedValue}`;
       })
       .join('\n')}
    `;
  }
}
