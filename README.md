# Github Metrics

Github Action that tracks the following metrics on a Github repository:

- Number of Pull Requests Opened
- Number of Pull Requests Closed
- Number of Pull Requests Merged
- Number of hotfixes
- Aggregated Pull Request Review Depth (number of comments, reviews and reviewers)
- Time to Merge
- Average Pull Request Idle Time

If you would like to know more about the metrics themselves, please see
[metrics.md](./metrics.md).

## Usage

To use this github action, specify it in your github workflow file. Here's an example:

```
name: Report Metrics

on:
  schedule:
    # At 16:00 UTC every Friday (aka 11am EST, 12pm EDT)
    - cron: "0 16 * * 5"

jobs:
  report:
    name: Slack
    runs-on: ubuntu-latest

    steps:
      - uses: Addepar/github-metrics@v1.2.0
        with:
          github-owner: bantic
          github-repo: github-metrics
          github-token: ${{secrets.GITHUB_TOKEN}}
          slack-app-token: ${{secrets.SLACK_APP_TOKEN}}
          slack-channel-id: ${{secrets.SLACK_CHANNEL_ID}}
          post-to-slack: "true"
          log-debug-messages: "true"
```

By default, the report will include all metrics. Workflow-related metrics will be run for all active workflows.
To change this, specify a config-yml input. See "Configuration" below.

### Configuration

The action can accept a configuration string in yml format in
order to specify the period to report over, which metrics to run, and for workflow-related metrics which workflows should be included.

Here's an example:

```
period: "month" # run a 1-month interval, ending now.
                # other valid values are "day" and "week"
metrics:        # array of metric specifiers
  - name: "workflow/success"   # 'name' is required
    # Only workflows that match the paths listed here
    # will run the WorkflowSuccess metric
    include:
      paths:
        - .github/workflows/my-workflow.yml
    # Workflows matching these paths will be excluded
    exclude:
      paths:
        - .github/workflows/dont-run-this-one.yml
    # Extra options for the metric can be passed using "options"
    options:
      branch: 'master'

  # When no include/exclude are passed,
  # this WorkflowDuration metric will run for every available
  # workflow
  - name: "workflow/duration"

  # The non-workflow metrics do not accept additional
  # configuration properties
  - name: "pull-request/time-to-merge"
```

Note on the include.paths and exclude.paths:

- exclude paths take precendence: If a path is listen in exclude.paths, that workflow will never be included (even if its path is also in include.paths)
- If include.paths and/or exclude.paths are passed, only matching workflows are included -- all others are ignored
- If neither include.paths or exclude.paths are passed, all
  workflows will be included

## Development

- `yarn build` (build the project)
- `yarn compile` (package the action in one file: `dist/index.js`)
- `yarn dev` (build, and rebuild when source is changed)
- `yarn lint` (run the linter)
- `yarn test` (run tests)

## Tests using Live Github API

Some of the tests use [PollyJS](https://netflix.github.io/pollyjs/#/README) to record HAR files resulting from the real Github API.

The repo [bantic/github-metrics-tests](https://github.com/bantic/github-metrics-tests) is used as the source of that live
Github API data. Example PRs have been opened (and closed, merged, etc.) to simulate the types of activity that we see on real PRs.

When running tests, the recorded HAR files are used unless the env var `RECORD_REQUESTS` is set.
When `RECORD_REQUESTS` is set, the env var `GITHUB_RECORDING_TOKEN` must also be set.

To "refresh" the recorded HAR files:

- ensure you have a valid Github access token that can access bantic/github-metrics-tests (a personal access token with no permissions should do it)
- set the env var `GITHUB_RECORDING_TOKEN` to the value of that token
- run `yarn test:record-requests`

The HAR files, in `tests/fixtures/__recordings__` will all change (because they include the local date and some other information that changes when they are re-run) and should be checked in again after confirming that the diff is acceptable.

To add a new test that uses live data:

- Add the test that makes the request. Be sure to call `setupPolly` first
- set the env `RECORD_REQUESTS` and `GITHUB_RECORDING_TOKEN` vars
  - Note that the repo and owner are currently hardcoded, in `jest.setup.js`, to `bantic/github-metrics-tests`
- Run your test (e.g. `jest path/to/my/test`)
- A new recording should be created

At this point you can unset the `RECORD_REQUESTS` and iterate locally using the recording. Or follow the steps above to regenerate it if needed.

### Debugging

You can run individual scripts using `ts-node`. In order to use them with breakpoints, run the script like this:

```
node --inspect-brk -r ts-node/register src/path/to/ts-file.ts
```

And then open the chrome devtools at: `chrome://inspect`.

This [article](https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27) has some more details.

You can run a test with the debugger in a similar manner. For instance, to run the metrics
tests using the chrome inspector for debugging, run:

```
node --inspect-brk node_modules/.bin/jest --runInBand tests/metrics
```

Both of the above commands can be run without `--inspect-brk` if you just want to run the script or test in isolation and don't need the debugger.

### Use DEBUG=github-metrics:\*

The codebase uses the [debug package](https://github.com/visionmedia/debug#readme) to log debugging info.
Set the env var `DEBUG` to view logs. To see all of them, use `DEBUG=github-metrics:*`. See debug's docs for more.

### Simulate a run locally

In order to simulate a run of this action, run the `index.ts` file with some or all of the following environment variables:

- (required) GITHUB_TOKEN
- (required) GITHUB_OWNER
- (required) GITHUB_REPO
- (optional) `export POST_TO_SLACK=false` - to skip posting to a slack channel and display the output on the console only.
- (optional) CONFIG_YML - to use a specific configuration. If not specified, default config is used. See Configuration section

Note: In order to set a multi-line yml file as an environment variable, a simple way is to write the yml file and then `cat` it into the env var, e.g.:

```
vim my-config.yml # create/edit file
export CONFIG_YML=`cat my-config.yml`
```

After setting the env vars appropriately, run the index.ts script:

```
node -r ts-node src/index.ts
```

## Documentation

To build a new version of the docs, run `yarn build-with-docs`.

## @vercel/ncc

According to [GH docs](https://git.io/Jqnuf), you _need_ to commit
`node_modules` folder.

That seems like a nightmare, so we use [@vercel/ncc](https://github.com/vercel/ncc)
to compile the code and Node Modules into one file.

Install `vercel/ncc` via `npm install -g @vercel/ncc`

## Deployment & Release

Once the changes are made, you should:

- Run `yarn compile`
- Commit via `git commit -m "The change"`
- Tag via `git tag -a -m "My first action release" v1`
- Push to Github via `git push --follow-tags` or `git push origin **v1**`
