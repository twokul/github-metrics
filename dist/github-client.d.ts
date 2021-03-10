export declare enum AnalysisPeriod {
    DAY = "day",
    WEEK = "week",
    MONTH = "month"
}
declare type PullRequestReview = {
    submittedAt: string;
    author: string;
};
declare type PullRequestComment = {
    publishedAt: string;
    author: string;
};
export declare enum PullRequestState {
    OPENED = "OPEN",
    MERGED = "MERGED",
    CLOSED = "CLOSED"
}
export declare class PullRequest {
    title: string;
    state: string;
    baseRefName: string;
    number: number;
    mergedAt: string;
    createdAt: string;
    comments: Array<PullRequestComment>;
    reviews: Array<PullRequestReview>;
    constructor(pullRequest: {
        mergedAt: string;
        number: string;
        createdAt: string;
        title: string;
        state: string;
        baseRefName: string;
        reviews: {
            edges: Array<{
                node: {
                    submittedAt: string;
                    author: {
                        login: string;
                    };
                };
            }>;
        };
        comments: {
            edges: Array<{
                node: {
                    publishedAt: string;
                    author: {
                        login: string;
                    };
                };
            }>;
        };
    });
}
export default class GithubClient {
    #private;
    constructor({ token }: {
        token: string;
    });
    getPullRequest({ owner, repo, pullRequestNumber }: {
        owner: string;
        repo: string;
        pullRequestNumber: number;
    }): Promise<PullRequest>;
    getPullRequestsByPeriod({ owner, repo, period, limit }: {
        owner: string;
        repo: string;
        period?: AnalysisPeriod;
        limit?: number;
    }): Promise<Array<PullRequest>>;
}
export {};
