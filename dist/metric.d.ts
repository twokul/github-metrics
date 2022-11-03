import { Interval } from 'luxon';
export declare type NumericMetricData = {
    value: number;
    rawValue?: any;
};
export declare const METRIC_NAME_TO_CONSTRUCTOR: {
    [key: string]: new (...args: any[]) => Metric;
};
export declare function percentiles(ps: number[], metric: Metric): number[];
export interface Metric {
    name: string;
    interval: Interval;
    data: any[];
    hasData: boolean;
    summary: string[];
    didRun: boolean;
    run: () => Promise<void>;
}
export interface NumericMetric extends Metric {
    data: NumericMetricData[];
}
