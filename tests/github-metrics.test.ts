import GithubMetrics from '../src/github-metrics';

describe('Github Metrics', () => {
  test('no', () => {
    const githubMetrics = new GithubMetrics({ token: 'fake-token' });

    expect(githubMetrics).toBeDefined();
  })
});
