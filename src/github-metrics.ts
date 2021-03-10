/**
 * @packageDocumentation A small library to fetch aggregated information from Github.
 */

type Report = {
  name: string;
  openPullRequests: number;
  closedPullRequests: number;
  mergedPullRequests: number;
  averageTimeToMerge: number;
  averageIdleTime: number;
  aggregatedReviewDepth: {
    comments: number;
    reviews: number,
    reviewers: number,
  };
  hotfixes: number;
}

export default class GithubMetrics {
  constructor({ token }: { token: string }) {

  }

  async generateDailyReport({ owner, repo }: { owner: string; repo: string }): Promise<Report> {
    return Promise.resolve({
      aggregatedReviewDepth: {},
    } as Report);
  }
}
