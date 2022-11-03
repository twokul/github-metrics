import { Interval } from 'luxon';
import { WorkflowRun, STATUS_TYPE, CONCLUSION_TYPE } from '../models/workflow-run';
declare type WorkflowRunResults = {
    runs: WorkflowRun[];
    meta: {
        total_pages: number;
    };
};
export declare type WorkflowData = {
    id: string | number;
    name: string;
    path?: string;
};
export declare function fetchWorkflows(): Promise<WorkflowData[]>;
export declare type FetchWorkflowRunsOptions = {
    per_page?: number;
    status?: STATUS_QUERY_TYPE;
    branch?: string;
};
declare type STATUS_QUERY_TYPE = STATUS_TYPE | CONCLUSION_TYPE;
export declare const STATUS_SUCCESS: STATUS_QUERY_TYPE;
export declare const STATUS_COMPLETED: STATUS_QUERY_TYPE;
export declare function fetchWorkflowRuns(interval: Interval, workflowId: number | string, options?: FetchWorkflowRunsOptions): Promise<WorkflowRunResults>;
export {};
