import GithubClient from './github-client';
import RepositoryReport from './reports/repository';
import { generateDateRange, Period } from './utils/date';

export default class GithubMetrics {
  #githubClient;

  constructor({ token }: { token: string }) {
    this.#githubClient = new GithubClient({ token });
  }

  async generateDailyReport({
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  }): Promise<RepositoryReport> {
    const { startDate, endDate } = generateDateRange();
    const pullRequests = await this.#githubClient.getPullRequestsByPeriod({
      owner,
      repo,
      startDate,
      endDate,
    });

    return new RepositoryReport({ pullRequests, owner, repo, startDate, endDate });
  }

  async generateWeeklyReport({
    owner,
    repo,
  }: {
    owner: string;
    repo: string;
  }): Promise<RepositoryReport> {
    const { startDate, endDate } = generateDateRange(Period.WEEK);
    const pullRequests = await this.#githubClient.getPullRequestsByPeriod({
      owner,
      repo,
      startDate,
      endDate,
    });

    return new RepositoryReport({ pullRequests, owner, repo, startDate, endDate });
  }
}
