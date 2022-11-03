"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.singlePullRequest = exports.fetchMergedPullRequestNumbers = void 0;
const env_1 = require("./env");
const env_2 = require("../utils/env");
const debug_1 = require("./debug");
const debugBase = debug_1.default.extend('graphql');
async function fetchMergedPullRequestNumbers(interval) {
    let client = env_2.githubGraphqlClient();
    let data = await client(mergedPullRequestNumbersQuery(interval));
    debugBase.extend('results:merged-pull-request-numbers:data')(JSON.stringify(data));
    let result = data.search.nodes.map((node) => Number(node.number));
    debugBase.extend('results:merged-pull-request-numbers')(result);
    return result;
}
exports.fetchMergedPullRequestNumbers = fetchMergedPullRequestNumbers;
function mergedPullRequestNumbersQuery(interval) {
    let { repo, owner } = env_1.githubArgs();
    let intervalStr = interval
        .toISO({ suppressMilliseconds: true })
        .replace('/', '..');
    let query = `
  query {
    search(query: "repo:${owner}/${repo} is:pr merged:${intervalStr} sort:updated-desc", type:ISSUE, first:100) {
      nodes {
        ...on PullRequest {
          number
        }
      }
    }
  }`;
    debugBase.extend('queries:merged-pull-request-numbers')(query);
    return query;
}
function singlePullRequest(number) {
    let { repo, owner } = env_1.githubArgs();
    return `
  {
    repository(name: "${repo}", owner: "${owner}") {
      pullRequest(number: ${number}) {
        mergedAt
        merged
        createdAt
        id
        number
        baseRefName
        author {
          login
        }
        timelineItems(first: 100, itemTypes: [PULL_REQUEST_REVIEW, REVIEW_REQUESTED_EVENT, READY_FOR_REVIEW_EVENT, CONVERT_TO_DRAFT_EVENT, REOPENED_EVENT, MERGED_EVENT]) {
          nodes {
            __typename
            ... on PullRequestReview {
              createdAt
              author {
                login
              }
              state
            }
            ... on ReviewRequestedEvent {
              createdAt
              actor {
                login
              }
            }
            ... on ReadyForReviewEvent {
              createdAt
              actor {
                login
              }
            }
            ... on MergedEvent {
              createdAt
            }
            ... on ConvertToDraftEvent {
              createdAt
            }
            ... on ReopenedEvent {
              createdAt
            }
          }
        }
      }
    }
  }
   
  `;
}
exports.singlePullRequest = singlePullRequest;
