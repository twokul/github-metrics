import RepositoryReport from './reports/repository';
export default class GithubMetrics {
    #private;
    constructor({ token }: {
        token: string;
    });
    generateDailyReport({ owner, repo, }: {
        owner: string;
        repo: string;
    }): Promise<RepositoryReport>;
    generateWeeklyReport({ owner, repo, }: {
        owner: string;
        repo: string;
    }): Promise<RepositoryReport>;
}
