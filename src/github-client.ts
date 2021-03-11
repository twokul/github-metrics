import { graphql } from '@octokit/graphql';

type PullRequestReview = {
  submittedAt: string;
  author: string;
};
type PullRequestComment = {
  publishedAt: string;
  author: string;
};
export enum PullRequestState {
  OPENED = 'OPEN',
  MERGED = 'MERGED',
  CLOSED = 'CLOSED',
}
export class PullRequest {
  title: string;

  state: string;

  baseRefName: string;

  number: number;

  mergedAt: string | null;

  createdAt: string;

  comments: Array<PullRequestComment>;

  reviews: Array<PullRequestReview>;

  constructor(pullRequest: {
    mergedAt: string | null;
    number: number;
    createdAt: string;
    title: string;
    state: string;
    baseRefName: string;
    reviews: {
      edges: Array<{
        node: {
          submittedAt: string;
          author: {
            login: string;
          };
        };
      }>;
    };
    comments: {
      edges: Array<{
        node: {
          publishedAt: string;
          author: {
            login: string;
          };
        };
      }>;
    };
  }) {
    const {
      mergedAt,
      number,
      createdAt,
      title,
      state,
      baseRefName,
    } = pullRequest;
    const reviews = pullRequest.reviews.edges.map((edge) => {
      return {
        submittedAt: edge.node.submittedAt,
        author: edge.node.author.login,
      };
    });
    const comments = pullRequest.comments.edges.map((edge) => {
      return {
        publishedAt: edge.node.publishedAt,
        author: edge.node.author.login,
      };
    });

    this.title = title;
    this.number = Number(number);
    this.mergedAt = mergedAt;
    this.createdAt = createdAt;
    this.comments = comments;
    this.reviews = reviews;
    this.state = state;
    this.baseRefName = baseRefName;
  }
}

export default class GithubClient {
  #graphql;

  constructor({ token }: { token: string }) {
    this.#graphql = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  async getPullRequest({
    owner,
    repo,
    pullRequestNumber,
  }: {
    owner: string;
    repo: string;
    pullRequestNumber: number;
  }): Promise<PullRequest> {
    const response: {
      repository: {
        pullRequest: any;
      };
    } = await this.#graphql(`
      {
        repository(owner: "${owner}", name: "${repo}") {
          pullRequest(number: ${pullRequestNumber}) {
            title
            number
            mergedAt
            createdAt
            state
            baseRefName
            comments (first: 100) {
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
            reviews (first: 100) {
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
    `);

    return new PullRequest(response.repository.pullRequest);
  }

  async getPullRequestsByPeriod({
    owner,
    repo,
    limit = 50,
    startDate,
    endDate,
  }: {
    owner: string;
    repo: string;
    limit?: number;
    startDate: string;
    endDate: string;
  }): Promise<Array<PullRequest>> {
    const response: {
      search: {
        edges: Array<any>;
      };
    } = await this.#graphql(`
      {
        search(query: "repo:${owner}/${repo} created:${startDate}..${endDate}", type: ISSUE, last: ${limit}) {
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
    `);

    return response.search.edges.map((edge) => {
      return new PullRequest(edge.node);
    });
  }
}
