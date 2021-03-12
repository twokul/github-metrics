import { PullRequest } from '../../src/github-client';
import RepositoryReport from '../../src/reports/repository';
import * as td from 'testdouble';
import { DateTime } from 'luxon';
import PRS_THIS_WEEK from '../fixtures/prs-this-week';

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
    const pullRequests = [] as Array<PullRequest>;
    const report = new RepositoryReport({ pullRequests, owner, repo, startDate: '2021-03-08', endDate: '2021-03-14' });

    expect(report.name).toEqual('Marvel/Avengers');
    expect(report.openedPullRequests).toEqual([]);
    expect(report.closedPullRequests).toEqual([]);
    expect(report.mergedPullRequests).toEqual([]);
    expect(report.hotfixes).toEqual(0);
    expect(report.url).toEqual('https://github.com/Marvel/Avengers/pulls?q=created:2021-03-08..2021-03-14');
    expect(report.averageIdleTime).toEqual(0);
    expect(report.averageTimeToMerge).toEqual(0);
    expect(report.aggregatedReviewDepth).toEqual({
      comments: 0,
      reviews: 0,
      reviewers: 0,
    });
  });

  test('it generates correct report given a list of pull requests', () => {
    const owner = 'Marvel';
    const repo = 'Avengers';
    const pullRequests = PRS_THIS_WEEK.search.edges.map((edge) => {
      return new PullRequest(edge.node);
    });

    const report = new RepositoryReport({ pullRequests, owner, repo, startDate: '2021-03-08', endDate: '2021-03-14' });

    expect(report.name).toEqual('Marvel/Avengers');
    expect(report.openedPullRequests.length).toEqual(15);
    expect(report.closedPullRequests.length).toEqual(19);
    expect(report.mergedPullRequests.length).toEqual(14);
    expect(report.hotfixes).toEqual(0);
    expect(report.url).toEqual('https://github.com/Marvel/Avengers/pulls?q=created:2021-03-08..2021-03-14');
    expect(report.averageIdleTime).toEqual(7.6875);
    expect(report.averageTimeToMerge).toEqual(11.270833333333334);
    expect(report.aggregatedReviewDepth).toEqual({
      comments: 0,
      reviews: 51,
      reviewers: 32,
    });
  });
});
