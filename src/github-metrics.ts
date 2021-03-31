import GithubClient from './github-client';
import RepositoryReport from './reports/repository';
import { DateRange, generateDateRange, Period } from './utils/date';

export default class GithubMetrics {
  #githubClient;

  constructor({ token }: { token: string }) {
    this.#githubClient = new GithubClient({ token });
  }

  async generateReport({
    owner,
    repo,
    dateRange,
  }: {
    owner: string;
    repo: string;
    dateRange: DateRange;
  }) {
    const { startDate, endDate } = dateRange;
    const pullRequests = await this.#githubClient.getPullRequestsByPeriod({
      owner,
      repo,
      startDate: startDate.toString(),
      endDate: endDate.toString(),
    });

    return new RepositoryReport({
      pullRequests,
      owner,
      repo,
      startDate: startDate.toISODate(),
      endDate: endDate.toISODate(),
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
      dateRange: generateDateRange(Period.DAY),
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
      dateRange: generateDateRange(Period.WEEK),
    });
  }
}
