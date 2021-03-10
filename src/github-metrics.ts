/**
 * @packageDocumentation A small library to fetch aggregated information from Github.
 */

import GithubClient from "./github-client";
import RepositoryReport from './reports/repository';

export default class GithubMetrics {
  #githubClient;

  constructor({ token }: { token: string }) {
    this.#githubClient = new GithubClient({ token });
  }

  async generateDailyReport({ owner, repo }: { owner: string; repo: string }): Promise<RepositoryReport> {
    const pullRequests = await this.#githubClient.getPullRequestsByPeriod({
      owner,
      repo,
    });

    return new RepositoryReport({ pullRequests, owner, repo });
  }
}
