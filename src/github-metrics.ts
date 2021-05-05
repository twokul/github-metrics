import { Interval } from 'luxon';
import GithubClient from './github-client';
import RepositoryReport from './reports/repository';
import { getInterval, Period } from './utils/date';

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
      startDate: interval.start.toString(),
      endDate: interval.end.toString(),
    });

    return new RepositoryReport({
      pullRequests,
      owner,
      repo,
      startDate: interval.start.toISODate(),
      endDate: interval.end.toISODate(),
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
      interval: getInterval(Period.DAY),
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
      interval: getInterval(Period.WEEK),
    });
  }
}
