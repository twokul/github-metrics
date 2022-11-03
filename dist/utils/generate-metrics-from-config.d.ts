import { Metric } from '../metric';
import { WorkflowData } from './api-requests';
export declare type MetricsConfig = {
    period?: string;
    metrics: ({
        name: string;
    } & WorkflowConfig)[];
};
declare type WorkflowConfig = {
    exclude?: {
        paths: string[];
    };
    include?: {
        paths: string[];
    };
    options?: any;
};
export declare function findIncludedWorkflows(workflows: WorkflowData[], config: WorkflowConfig): WorkflowData[];
export declare function generateMetrics(config: MetricsConfig, allWorkflows?: WorkflowData[]): Metric[];
export {};
