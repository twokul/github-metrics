// import { PullRequest } from '../../src/github-client';
import RepositoryReport from '../../src/reports/repository';
import * as td from 'testdouble';
import { DateTime } from 'luxon';

describe('Repository Report', () => {
  beforeAll(() => {
    td.replace(DateTime, 'now', () => {
      return DateTime.fromISO('2021-03-11T17:35:54Z');
    });
  });

  afterAll(() => td.reset());

  test('it generates correct report given an empty list of pull requests', () => {
    const owner = 'Marvel';
    const repo = 'Avengers';
    const pullRequests = [];
    const report = new RepositoryReport({ pullRequests, owner, repo });

    expect(report.name).toEqual('Marvel/Avengers');
    expect(report.openedPullRequests).toEqual([]);
    expect(report.closedPullRequests).toEqual([]);
    expect(report.mergedPullRequests).toEqual([]);
    expect(report.hotfixes).toEqual(0);
    expect(report.averageIdleTime).toEqual(null);
    expect(report.averageTimeToMerge).toEqual(null);
    expect(report.aggregatedReviewDepth).toEqual({
      comments: 0,
      reviews: 0,
      reviewers: 0,
    });
  });
});
