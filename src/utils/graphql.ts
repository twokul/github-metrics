import { Interval } from 'luxon';

export function singlePRQuery(
  owner: string,
  repo: string,
  number: number
): string {
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
export function mergedPRsQuery(
  owner: string,
  repo: string,
  interval: Interval
) {
  let queryInterval = `${interval.start.toISO()}..${interval.end.toISO()}`;
  let limit = 100;
  return `{
    search(query: "repo:${owner}/${repo} merged:${queryInterval} is:merged sort:updated-desc", type: ISSUE, last: ${limit}) {
      nodes {
        ... on PullRequest {
          mergedAt
          createdAt
          id
          number
          baseRefName
          author { login }
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
  }`;
}
