import { Interval } from 'luxon';
import { Debugger } from '../../utils/debug';
import { NumericMetric, NumericMetricData } from '../../metric';
export default class MergedPRsMetric implements NumericMetric {
    interval: Interval;
    debug: Debugger;
    data: NumericMetricData[];
    didRun: boolean;
    name: string;
    constructor(interval: Interval);
    get hasData(): boolean;
    get summary(): string[];
    run(): Promise<void>;
}
