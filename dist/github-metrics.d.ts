import { Interval } from 'luxon';
import RepositoryReport from './reports/repository';
export default class GithubMetrics {
    #private;
    constructor({ token }: {
        token: string;
    });
    generateReport({ owner, repo, interval, }: {
        owner: string;
        repo: string;
        interval: Interval;
    }): Promise<RepositoryReport>;
    generateDailyReport({ owner, repo, }: {
        owner: string;
        repo: string;
    }): Promise<RepositoryReport>;
    generateWeeklyReport({ owner, repo, }: {
        owner: string;
        repo: string;
    }): Promise<RepositoryReport>;
}
