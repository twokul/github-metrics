import percentilesUtil from './utils/percentiles';
export type NumericMetricData = {
  value: number;
  rawValue?: any;
};

export function percentiles(ps: number[], metric: Metric): number[] {
  let data = metric.data.map((datum) => datum.value);
  return percentilesUtil(ps, data);
}

export interface Metric {
  name: string;
  data: any[];
  summary: string;
  run: () => Promise<void>;
}

export interface NumericMetric extends Metric {
  data: NumericMetricData[];
}
