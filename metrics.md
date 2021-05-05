# Metrics

Measuring effectiveness (productivity) metrics is exceptionally challenging
as it is challenging to define "productivity." For simplicity sake, let’s
define "productivity" as a relationship between the input and the output. The
input is a blend of factors (technical, individual, human, etc.) The output
should be functional software that creates value for customers. It stands to
reason that if you remove the blockers from the input, productivity will
increase naturally.

Several metrics allow you to quickly and accurately diagnose where work gets
stuck, who needs help, and where the greatest opportunities lie for
continuous improvement.

## Number of Pull Requests Opened

The number of opened pull requests.

## Number of Pull Requests Closed

The number of closed pull requests.

## Number of Pull Requests Merged

The number of merged pull requests.

## Number of hotfixes

The number of pull requests against `release/*` branch.

## Aggregated Pull Request Review Depth

The aggregated number of comments, reviews and reviewers across all pull
requests.

## Time to Merge

Time to Merge measured from when the pull request is "opened for review" to when it is merged.

"opened for review" is determined using a heuristic:

- If a PR was ever closed, disregard any events before it was closed
- If the PR was ever in draft state, return the time it was marked "ready for review"
- If the PR was never in draft state but a review was requested, use the time of the first review request
  - (It's possible for a PR to have a review request after merging, to disregard the review request in that case)
- Default to the PR's "createdAt" time

The slack report includes p0, p50, p90 and p100 values.
Here's how to reason about those:

- p0: The shorted time-to-merge
- p50: Same as the median: 50% of the PRs were merged in this time
- p90: 90% of PRs were merged in this time
- p100: The slowest-to-merge PR

## Average Pull Request Idle Time

Idle time is the amount of time elapsed from "pull request created" to "first
review submitted" across all merged and opened pull requests.
