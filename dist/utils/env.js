"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGithubArgs = exports.githubArgs = exports.githubGraphqlClient = void 0;
const graphql_1 = require("@octokit/graphql");
const DEFAULT_GITHUB_OWNER = 'Addepar';
const DEFAULT_GITHUB_REPO = 'Iverson';
function githubGraphqlClient() {
    let args = githubArgs();
    let options = {};
    if (args.token) {
        options.headers = { authorization: `token ${args.token}` };
    }
    return graphql_1.graphql.defaults(options);
}
exports.githubGraphqlClient = githubGraphqlClient;
function githubArgs() {
    const owner = process.env.GITHUB_OWNER || DEFAULT_GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO || DEFAULT_GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error(`Required env.GITHUB_TOKEN`);
    }
    return { owner, repo, token };
}
exports.githubArgs = githubArgs;
function setGithubArgs(owner, repo, token) {
    process.env.GITHUB_OWNER = owner;
    process.env.GITHUB_REPO = repo;
    process.env.GITHUB_TOKEN = token;
}
exports.setGithubArgs = setGithubArgs;
