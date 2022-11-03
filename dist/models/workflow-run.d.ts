import { DateTime, Duration } from 'luxon';
import { Debugger } from '../utils/debug';
export declare type STATUS_TYPE = 'queued' | 'in_progress' | 'completed';
export declare type CONCLUSION_TYPE = 'action_required' | 'cancelled' | 'failure' | 'neutral' | 'success' | 'skipped' | 'stale' | 'timed_out';
export interface WorkflowRunData {
    id: number;
    status: STATUS_TYPE;
    conclusion: CONCLUSION_TYPE;
    workflow_id: number;
    check_suite_id: number;
    created_at: string;
    updated_at: string;
}
export declare class WorkflowRun {
    data: WorkflowRunData;
    id: number;
    debug: Debugger;
    status: STATUS_TYPE;
    conclusion: CONCLUSION_TYPE;
    workflowId: number;
    checkSuiteId: number;
    createdAt: DateTime;
    updatedAt: DateTime;
    constructor(data: WorkflowRunData);
    get duration(): Duration;
}
