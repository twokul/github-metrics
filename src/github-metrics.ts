import { Interval } from 'luxon';
import GithubClient from './github-client';
import RepositoryReport from './reports/repository';
import { generateDateRange, Period } from './utils/date';

export default class GithubMetrics {
  #githubClient;

  constructor({ token }: { token: string }) {
    this.#githubClient = new GithubClient({ token });
  }

  async generateReport({
    owner,
    repo,
    interval,
  }: {
    owner: string;
    repo: string;
    interval: Interval;
  }) {
    const pullRequests = await this.#githubClient.getPullRequestsByPeriod({
      owner,
      repo,
      interval,
    });

    return new RepositoryReport({
      pullRequests,
      owner,
      repo,
      interval,
    });
  }

  async generateDailyReport({
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  }): Promise<RepositoryReport> {
    return this.generateReport({
      owner,
      repo,
      interval: generateDateRange(Period.DAY),
    });
  }

  async generateWeeklyReport({
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  }): Promise<RepositoryReport> {
    return this.generateReport({
      owner,
      repo,
      interval: generateDateRange(Period.WEEK),
    });
  }
}
