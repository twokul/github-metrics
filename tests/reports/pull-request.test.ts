import { PullRequest } from '../../src/github-client';
import PullRequestReport from '../../src/reports/pull-request';
import MERGED_PULL_REQUEST from '../fixtures/merged-pr';
import OPEN_NO_REVIEWS from '../fixtures/open-no-reviews';
import OPEN_WITH_REVIEWS from '../fixtures/open-with-reviews';
import * as td from 'testdouble';
import { DateTime } from 'luxon';

describe('Pull Request Report', () => {
  beforeAll(() => {
    td.replace(DateTime, 'now', () => {
      return DateTime.fromISO('2021-03-11T17:35:54Z');
    });
  });

  afterAll(() => td.reset());

  test('it generates correct report for a merged PR', () => {
    const pullRequest = new PullRequest(MERGED_PULL_REQUEST.repository.pullRequest);
    const pullRequestReport = new PullRequestReport(pullRequest);

    expect(pullRequestReport).toBeDefined();
    expect(pullRequestReport.title).toEqual('Add two more ESLint rules');
    expect(pullRequestReport.pullRequestNumber).toEqual(1);
    expect(pullRequestReport.isHotfix).toEqual(false);
    expect(pullRequestReport.idleTime.toFormat('h')).toEqual('1');
    expect(pullRequestReport.timeToMerge.toFormat('h')).toEqual('1');
    expect(pullRequestReport.reviewDepth).toEqual({
      comments: 1,
      reviewers: 1,
      reviews: 1,
    });
  });

  test('it generates correct report for an opened PR with no reviews', () => {
    const pullRequest = new PullRequest(OPEN_NO_REVIEWS.repository.pullRequest);
    const pullRequestReport = new PullRequestReport(pullRequest);

    expect(pullRequestReport).toBeDefined();
    expect(pullRequestReport.title).toEqual('Add Github Metrics action');
    expect(pullRequestReport.pullRequestNumber).toEqual(1);
    expect(pullRequestReport.isHotfix).toEqual(false);
    expect(pullRequestReport.idleTime.toFormat('h')).toEqual('21');
    expect(pullRequestReport.timeToMerge.toFormat('h')).toEqual('21');
    expect(pullRequestReport.reviewDepth).toEqual({
      comments: 0,
      reviewers: 0,
      reviews: 0,
    });
  });

  test('it generates correct report for an opened PR with reviews', () => {
    const pullRequest = new PullRequest(OPEN_WITH_REVIEWS.repository.pullRequest);
    const pullRequestReport = new PullRequestReport(pullRequest);

    expect(pullRequestReport).toBeDefined();
    expect(pullRequestReport.title).toEqual('Change all the stuff');
    expect(pullRequestReport.pullRequestNumber).toEqual(1);
    expect(pullRequestReport.isHotfix).toEqual(false);
    expect(pullRequestReport.idleTime.toFormat('h')).toEqual('335');
    expect(pullRequestReport.timeToMerge.toFormat('h')).toEqual('986');
    expect(pullRequestReport.reviewDepth).toEqual({
      comments: 5,
      reviewers: 8,
      reviews: 58,
    });
  });
});
