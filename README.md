# Github Metrics

Github Action that tracks the following metrics on a Github repository:

- Number of Pull Requests Opened
- Number of Pull Requests Closed
- Number of Pull Requests Merged
- Number of hotfixes
- Aggregated Pull Request Review Depth (number of comments, reviews and reviewers)
- Average Time to Merge
- Average Pull Request Idle Time

If you would like to know more about the metrics themselves, please see
[metrics.md](./metrics.md).

## Development

- `yarn build` (build the project)
- `yarn compile` (package the action in one file: `dist/index.js`)
- `yarn dev` (build, and rebuild when source is changed)
- `yarn lint` (run the linter)
- `yarn test` (run tests)

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
