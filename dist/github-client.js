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
exports.PullRequest = exports.PullRequestState = exports.AnalysisPeriod = void 0;
const graphql_1 = require("@octokit/graphql");
const luxon_1 = require("luxon");
var AnalysisPeriod;
(function (AnalysisPeriod) {
    AnalysisPeriod["DAY"] = "day";
    AnalysisPeriod["WEEK"] = "week";
    AnalysisPeriod["MONTH"] = "month";
})(AnalysisPeriod = exports.AnalysisPeriod || (exports.AnalysisPeriod = {}));
var PullRequestState;
(function (PullRequestState) {
    PullRequestState["OPENED"] = "OPEN";
    PullRequestState["MERGED"] = "MERGED";
    PullRequestState["CLOSED"] = "CLOSED";
})(PullRequestState = exports.PullRequestState || (exports.PullRequestState = {}));
class PullRequest {
    constructor(pullRequest) {
        const { mergedAt, number, createdAt, title, state, baseRefName } = pullRequest;
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
    constructor({ token }) {
        _graphql.set(this, void 0);
        __classPrivateFieldSet(this, _graphql, graphql_1.graphql.defaults({
            headers: {
                authorization: `token ${token}`,
            },
        }));
    }
    async getPullRequest({ owner, repo, pullRequestNumber }) {
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
    async getPullRequestsByPeriod({ owner, repo, period = AnalysisPeriod.DAY, limit = 50 }) {
        const now = luxon_1.DateTime.now();
        const today = now;
        const thisWeek = luxon_1.DateTime.fromObject({ weekNumber: now.weekNumber });
        const thisMonth = luxon_1.DateTime.fromObject({ month: now.month });
        let start = '';
        let end = '';
        switch (period) {
            case AnalysisPeriod.DAY:
                start = today.toFormat('yyyy-MM-dd');
                end = today.endOf('day').toString();
                break;
            case AnalysisPeriod.WEEK:
                start = thisWeek.toFormat('yyyy-MM-dd');
                end = thisWeek.endOf('week').toString();
                break;
            case AnalysisPeriod.MONTH:
                start = thisMonth.toFormat('yyyy-MM-dd');
                end = thisMonth.endOf('month').toString();
                break;
        }
        const response = await __classPrivateFieldGet(this, _graphql).call(this, `
      {
        search(query: "repo:${owner}/${repo} created:${start}..${end}", type: ISSUE, last: ${limit}) {
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
