import { graphql } from '@octokit/graphql';
import { Fetch, RequestParameters } from '@octokit/types';
import { DateTime, Interval } from 'luxon';
import { githubArgs } from './utils/env';
import logger from './utils/logger';

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

type PullRequestType = 'OPENED_FOR_REVIEW' | 'MERGED';

class PullRequestThin {
  id: string;
  title: string;
  number: number;
  createdAt: DateTime;
  state: string;
  isDraft: boolean;
  merged: boolean;
  mergedAt: DateTime | null;
  constructor({
    id,
    title,
    number,
    createdAt,
    state,
    isDraft,
    merged,
    mergedAt,
  }: {
    id: string;
    title: string;
    number: number;
    createdAt: string;
    state: string;
    isDraft: boolean;
    merged: boolean;
    mergedAt: string | null;
  }) {
    this.id = id;
    this.title = title;
    this.number = Number(number);
    this.createdAt = DateTime.fromISO(createdAt);
    this.merged = merged;
    this.mergedAt = this.merged ? DateTime.fromISO(mergedAt as string) : null;
    this.state = state;
    this.isDraft = isDraft;
  }
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

  constructor(options?: { token?: string; fetch?: Fetch }) {
    if (!options) {
      options = {};
    }
    let { token, fetch } = options;
    if (!token) {
      token = githubArgs().token;
    }
    let clientOptions = {
      headers: {
        authorization: `token ${token}`,
      },
    } as RequestParameters;

    if (fetch) {
      clientOptions.request = { fetch };
    }

    this.#graphql = graphql.defaults(clientOptions);
  }

  async query(graphqlQuery: string) {
    return await this.#graphql(graphqlQuery);
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

  async getPullRequests({
    owner,
    repo,
    type,
    interval,
  }: {
    owner: string;
    repo: string;
    type: PullRequestType;
    interval: Interval;
  }): Promise<Array<PullRequestThin>> {
    return await this.getPullRequestsOpenedForReview({
      owner,
      repo,
      interval,
    });
  }

  async getPullRequestsOpenedForReview({
    owner,
    repo,
    interval,
  }: {
    owner: string;
    repo: string;
    interval: Interval;
  }): Promise<Array<PullRequestThin>> {
    let createdInterval = `${interval.start.toISO()}..${interval.end.toISO()}`;
    let query = `is:pr is:open draft:false sort:created-desc created:${createdInterval} repo:${owner}/${repo}`;
    let last = 100;
    let createdQuery = `{
      search(query: "${query}", type: ISSUE, last:${last}) {
        nodes {
          ... on PullRequest {
            id
            title
            number
            createdAt
            state
            isDraft
            merged
            mergedAt
          }
        }
      }
    }`;
    logger.debug(`Running GraphQL Query:${createdQuery}`);
    const response: {
      search: {
        nodes: Array<any>;
      };
    } = await this.#graphql(createdQuery);

    let createdPrs = response.search.nodes.map(
      (obj) => new PullRequestThin(obj)
    );

    query = `is:pr draft:false sort:updated-desc created:${createdInterval} repo:${owner}/${repo}`;
    let updatedQuery = `{
      search(query: "${query}", type: ISSUE, last:${last}) {
        nodes {
          ... on PullRequest {
            id
            title
            number
            createdAt
            state
            isDraft
            merged
            mergedAt
            timelineItems(last: 1, itemTypes:[READY_FOR_REVIEW_EVENT]) {
              filteredCount
              nodes {
                ... on ReadyForReviewEvent {
                  createdAt
                }
              }
            }
          }
        }
      }
    }`;
    logger.info(`Loaded ${createdPrs.length} "created" PRs in interval`);
    for (let pr of createdPrs) {
      logger.debug(`Created PR: ${pr.number} ${pr.createdAt} "${pr.title}"`);
    }
    let createdPRIDs = createdPrs.map((pr) => pr.id);

    logger.debug(`Running GraphQL Query:${updatedQuery}`);
    let updatedResponse: {
      search: {
        nodes: Array<any>;
      };
    } = await this.#graphql(updatedQuery);
    logger.info(
      `Loaded ${updatedResponse.search.nodes.length} "updated" PRs in interval`
    );

    let updatedPRs = updatedResponse.search.nodes
      .filter((pr) => {
        let keep = !createdPRIDs.includes(pr.id);
        if (!keep) {
          logger.debug(
            `Excluding "updated" PR ${pr.number} because it is already in the "created" PR list`
          );
        }
        return keep;
      })
      .filter((pr) => {
        let keep = pr.timelineItems.filteredCount > 0;
        if (!keep) {
          logger.debug(
            `Excluding "updated" PR ${pr.number} because it does not have a "ReadyForReviewEvent"`
          );
        }
        return keep;
      })
      .filter((pr) => {
        let openedForReviewAt = DateTime.fromISO(
          pr.timelineItems.nodes[0].createdAt
        );
        let keep = interval.contains(openedForReviewAt);
        if (!keep) {
          logger.debug(
            `Excluding "updated" PR ${pr.number} because it was opened for review outside interval at ${openedForReviewAt}`
          );
        }
        return keep;
      })
      .map((pr) => new PullRequestThin(pr));

    let openedForReviewPRs = [...createdPrs, ...updatedPRs];
    logger.info(
      `Returning ${openedForReviewPRs.length} "opened-for-review" PRs`
    );
    openedForReviewPRs.forEach((pr) =>
      logger.debug(`"opened-for-review" PR: ${pr.number} ${pr.title}`)
    );
    return openedForReviewPRs;
  }

  async getPullRequestsByPeriod({
    owner,
    repo,
    limit = 50,
    interval,
  }: {
    owner: string;
    repo: string;
    limit?: number;
    interval: Interval;
  }): Promise<Array<PullRequest>> {
    let start = interval.start.toISO();
    let end = interval.end.toISO();

    const response: {
      search: {
        edges: Array<any>;
      };
    } = await this.#graphql(`
      {
        search(query: "repo:${owner}/${repo} updated:${start}..${end}", type: ISSUE, last: ${limit}) {
          edges {
            node {
              ... on PullRequest {
                title
                number
                mergedAt
                createdAt
                updatedAt
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
