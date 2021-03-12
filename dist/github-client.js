"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _graphql;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequest = exports.PullRequestState = void 0;
const graphql_1 = require("@octokit/graphql");
var PullRequestState;
(function (PullRequestState) {
    PullRequestState["OPENED"] = "OPEN";
    PullRequestState["MERGED"] = "MERGED";
    PullRequestState["CLOSED"] = "CLOSED";
})(PullRequestState = exports.PullRequestState || (exports.PullRequestState = {}));
class PullRequest {
    constructor(pullRequest) {
        const { mergedAt, number, createdAt, title, state, baseRefName, } = pullRequest;
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
exports.PullRequest = PullRequest;
class GithubClient {
    constructor({ token, fetch }) {
        _graphql.set(this, void 0);
        const options = {
            headers: {
                authorization: `token ${token}`,
            },
        };
        if (fetch) {
            options.request = { fetch };
        }
        __classPrivateFieldSet(this, _graphql, graphql_1.graphql.defaults(options));
    }
    async getPullRequest({ owner, repo, pullRequestNumber, }) {
        const response = await __classPrivateFieldGet(this, _graphql).call(this, `
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
    async getPullRequestsByPeriod({ owner, repo, limit = 50, startDate, endDate, }) {
        const response = await __classPrivateFieldGet(this, _graphql).call(this, `
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
exports.default = GithubClient;
_graphql = new WeakMap();
