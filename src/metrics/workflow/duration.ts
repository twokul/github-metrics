import { Interval } from 'luxon';
import {
  fetchWorkflowRuns,
  WorkflowData,
  STATUS_SUCCESS,
} from '../../utils/api-requests';
import debug, { Debugger } from '../../utils/debug';
import { durationToHuman, millisToHuman } from '../../utils/duration-to-human';
import { NumericMetric, NumericMetricData, percentiles } from '../../metric';
import { pluralize } from '../../utils/pluralize';

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

  get hasData() {
    if (!this.didRun) {
      throw new Error(`Must call run() first`);
    }
    return this.data.length > 0;
  }

  get summary() {
    if (!this.didRun) {
      throw new Error(`Cannot get summary before callling run()`);
    }
    if (this.data.length === 0) {
      return ['No data'];
    }

    let [p0, p50, p90, p100] = percentiles([0, 50, 90, 100], this);
    return [
      pluralize('%d Successful run', this.data.length),
      `p0 ${millisToHuman(p0)}`,
      `p50 ${millisToHuman(p50)}`,
      `p90 ${millisToHuman(p90)}`,
      `p100 ${millisToHuman(p100)}`,
    ];
  }

  async run(): Promise<void> {
    let { runs } = await fetchWorkflowRuns(
      this.interval,
      this.workflowData.id,
      { status: STATUS_SUCCESS }
    );
    this.debug(`found %o workflow runs for %o`, runs.length, this.workflowData);

    let data: NumericMetricData[] = [];
    runs.forEach((run) => {
      this.debug(`run #${run.id} duration: ${durationToHuman(run.duration)}`);
      data.push({ value: run.duration.toMillis() });
    });

    this.didRun = true;
    this.data = data;
  }
}
