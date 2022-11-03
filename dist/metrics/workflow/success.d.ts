import { Interval } from 'luxon';
import { WorkflowData, FetchWorkflowRunsOptions } from '../../utils/api-requests';
import { Debugger } from '../../utils/debug';
import { Metric } from '../../metric';
export default class WorkflowSuccessMetric implements Metric {
    interval: Interval;
    workflowData: WorkflowData;
    workflowRunOptions?: FetchWorkflowRunsOptions | undefined;
    data: {
        status: string;
        conclusion: string;
    }[];
    debug: Debugger;
    didRun: boolean;
    get name(): string;
    constructor(interval: Interval, workflowData: WorkflowData, workflowRunOptions?: FetchWorkflowRunsOptions | undefined);
    get hasData(): boolean;
    get summary(): string[];
    run(): Promise<void>;
    private load;
}
