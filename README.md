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

### Use DEBUG=github-metrics:\*

The codebase uses the [debug package](https://github.com/visionmedia/debug#readme) to log debugging info.
Set the env var `DEBUG` to view logs. To see all of them, use `DEBUG=github-metrics:*`. See debug's docs for more.

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
