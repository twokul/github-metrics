import GithubClient from '../src/github-client';
import fetchMock from 'fetch-mock';
import PR_THIS_WEEK from './fixtures/prs-this-week'
import { RequestHeaders } from '@octokit/types';

describe('Github Client', () => {
  test('authorisation header is set correctly', async () => {
    let headers = {} as RequestHeaders;
    let body = {};
    const fetch = fetchMock
      .sandbox()
      .post("https://api.github.com/graphql", (url, options) => {
        headers = options.headers as RequestHeaders;
        body = options.body;

        return { data: PR_THIS_WEEK };
      });

    const githubClient = new GithubClient({ token: 'fake-token', fetch });

    await githubClient.getPullRequestsByPeriod({
      owner: 'Marvel',
      repo: 'Avengers',
      startDate: '2021-03-08',
      endDate: '2021-03-14',
    });

    expect(headers.authorization).toEqual('token fake-token');
  });

  test('submits a correct query to fetch pull requests', async () => {
    let body = {};
    const fetch = fetchMock
      .sandbox()
      .post("https://api.github.com/graphql", (url, options) => {
        body = options.body;

        return { data: PR_THIS_WEEK };
      });

    const githubClient = new GithubClient({ token: 'fake-token', fetch });

    await githubClient.getPullRequestsByPeriod({
      owner: 'Marvel',
      repo: 'Avengers',
      startDate: '2021-03-08',
      endDate: '2021-03-14',
    });

    const bodyObject = JSON.parse(body as string);
    bodyObject.query = bodyObject.query.replace(/\s/g, '');

    expect(bodyObject).toEqual({
      query: `
        {
          search(query: "repo:Marvel/Avengers created:2021-03-08..2021-03-14", type: ISSUE, last: ${50}) {
            edges {
              node {
                ... on PullRequest {
                  title
                  number
                  mergedAt
                  createdAt
                  state
                  baseRefName
                  comments(first: 100) {
                    edges {
                      node {
                        author {
                          login
                        }
                        publishedAt
                        createdAt
                      }
                    }
                  }
                  reviews(first: 100) {
                    edges {
                      node {
                        author {
                          login
                        }
                        submittedAt
                        createdAt
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `.replace(/\s/g, '')
    });
  });

  test('the number of parsed pull request objects is correct', async () => {
    const fetch = fetchMock
      .sandbox()
      .post("https://api.github.com/graphql", () => {
        return { data: PR_THIS_WEEK };
      });

    const githubClient = new GithubClient({ token: 'fake-token', fetch });

    const response = await githubClient.getPullRequestsByPeriod({
      owner: 'Marvel',
      repo: 'Avengers',
      startDate: '2021-03-08',
      endDate: '2021-03-14',
    });

    expect(response.length).toEqual(48);
  });
});
