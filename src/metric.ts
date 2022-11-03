import { Interval } from 'luxon';
import percentilesUtil from './utils/percentiles';
import WorkflowDurationMetric from './metrics/workflow/duration';
import WorkflowSuccessMetric from './metrics/workflow/success';
import TimeToMergeMetric from './metrics/pull-request/time-to-merge';
import MergedPRsMetric from './metrics/pull-request/merged';

export type NumericMetricData = {
  value: number;
  rawValue?: any;
};

export const METRIC_NAME_TO_CONSTRUCTOR: {
  [key: string]: new (...args: any[]) => Metric;
} = {
  'workflow/duration': WorkflowDurationMetric,
  'workflow/success': WorkflowSuccessMetric,
  'pull-request/time-to-merge': TimeToMergeMetric,
  'pull-request/merged': MergedPRsMetric,
};

export function percentiles(ps: number[], metric: Metric): number[] {
  let data = metric.data.map((datum) => datum.value);
  return percentilesUtil(ps, data);
}

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
