import percentilesUtil from './utils/percentiles';
export type MetricData = {
  value: number;
  rawValue?: any;
};

export function percentiles(ps: number[], metric: Metric): number[] {
  let data = metric.data.map((datum) => datum.value);
  return percentilesUtil(ps, data);
}

export interface Metric {
  name: string;
  data: MetricData[];
  summary: string;

  run: () => Promise<void>;
}
