import { Interval } from 'luxon';
import { WorkflowData } from '../../utils/api-requests';
import { Debugger } from '../../utils/debug';
import { NumericMetric, NumericMetricData } from '../../metric';
export default class WorkflowDurationMetric implements NumericMetric {
    interval: Interval;
    workflowData: WorkflowData;
    debug: Debugger;
    data: NumericMetricData[];
    didRun: boolean;
    constructor(interval: Interval, workflowData: WorkflowData);
    get name(): string;
    get hasData(): boolean;
    get summary(): string[];
    run(): Promise<void>;
}
