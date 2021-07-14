import { Interval } from 'luxon';
import {
  fetchWorkflowRuns,
  WorkflowData,
  STATUS_SUCCESS,
} from '../../utils/api-requests';
import debug, { Debugger } from '../../utils/debug';
import { durationToHuman, millisToHuman } from '../../utils/duration-to-human';
import { NumericMetric, NumericMetricData, percentiles } from '../../metric';

export default class WorkflowDurationMetric implements NumericMetric {
  debug: Debugger;
  data: NumericMetricData[];
  didRun = false;
  constructor(public interval: Interval, public workflowData: WorkflowData) {
    this.debug = debug.extend(
      'metrics:workflow-duration:' + this.workflowData.id
    );
    this.data = [];
  }

  get name(): string {
    return `Workflow Duration for: "${this.workflowData.name}" (id ${this.workflowData.id})`;
  }

  get summary(): string {
    if (!this.didRun) {
      throw new Error(`Cannot get summary before callling run()`);
    }
    if (this.data.length === 0) {
      return 'No data';
    }

    let [p0, p50, p90, p100] = percentiles([0, 50, 90, 100], this);
    let pValues = `p0: ${millisToHuman(p0)}; p50: ${millisToHuman(
      p50
    )}; p90: ${millisToHuman(p90)}; p100: ${millisToHuman(p100)}`;

    return [`Successful run count: ${this.data.length}`, pValues].join('\n');
  }

  async run(): Promise<void> {
    let { runs } = await fetchWorkflowRuns(
      this.interval,
      this.workflowData.id,
      { status: STATUS_SUCCESS }
    );
    this.debug(`found ${runs.length} workflow runs for ${this.workflowData}`);

    let data: NumericMetricData[] = [];
    runs.forEach((run) => {
      this.debug(`run #${run.id} duration: ${durationToHuman(run.duration)}`);
      data.push({ value: run.duration.toMillis() });
    });

    this.didRun = true;
    this.data = data;
  }
}
