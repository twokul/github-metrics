declare type GithubArgs = {
    owner: string;
    repo: string;
    token: string;
};
export declare function githubGraphqlClient(): import("@octokit/graphql/dist-types/types").graphql;
export declare function githubArgs(): GithubArgs;
export declare function setGithubArgs(owner: string, repo: string, token: string): void;
export {};
