/**
 * @packageDocumentation A small library to fetch aggregated information from Github.
 */
import RepositoryReport from './reports/repository';
export default class GithubMetrics {
    #private;
    constructor({ token }: {
        token: string;
    });
    generateDailyReport({ owner, repo }: {
        owner: string;
        repo: string;
    }): Promise<RepositoryReport>;
}
