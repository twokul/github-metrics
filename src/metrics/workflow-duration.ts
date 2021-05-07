import { Interval } from 'luxon';
import { fetchWorkflowRuns } from '../utils/api-requests';
import debug, { Debugger } from '../utils/debug';
import { durationToHuman, millisToHuman } from '../utils/duration-to-human';
import { Metric, MetricData, percentiles } from '../metric';

export default class WorkflowDurationMetric implements Metric {
  debug: Debugger;
  data: MetricData[];
  name = 'Workflow Duration';
  didRun = false;
  constructor(public interval: Interval, public workflowId: string | number) {
    this.debug = debug.extend('metrics:workflow-duration:' + workflowId);
    this.data = [];
  }

  get summary(): string {
    if (!this.didRun) {
      throw new Error(`Cannot get summary before callling run()`);
    }
    if (this.data.length === 0) {
      return 'No data';
    }

    let [p0, p50, p90, p100] = percentiles([0, 50, 90, 100], this);
    return `p0: ${millisToHuman(p0)}; p50: ${millisToHuman(
      p50
    )}; p90: ${millisToHuman(p90)}; p100: ${millisToHuman(p100)}`;
  }

  async run(): Promise<void> {
    let workflowRuns = await fetchWorkflowRuns(this.interval, this.workflowId);
    this.debug(`found ${workflowRuns.length} workflow runs`);

    let data: MetricData[] = [];
    workflowRuns.forEach((run) => {
      this.debug(`run #${run.id} duration: ${durationToHuman(run.duration)}`);
      data.push({ value: run.duration.toMillis() });
    });

    this.didRun = true;
    this.data = data;
  }
}
