# Github Metrics

## Development

- `yarn build` (build the project)
- `yarn compile` (package the action in one file: `dist/index.js`)
- `yarn dev` (build, and rebuild when source is changed)
- `yarn lint` (run the linter)
- `yarn test` (run tests)

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
