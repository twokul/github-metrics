import { Interval } from 'luxon';
import {
  fetchWorkflowRuns,
  WorkflowData,
  FetchWorkflowRunsOptions,
  STATUS_COMPLETED,
} from '../../utils/api-requests';
import debug, { Debugger } from '../../utils/debug';
import { Metric } from '../../metric';

export default class WorkflowSuccessMetric implements Metric {
  data: {
    status: string;
    conclusion: string;
  }[] = [];
  debug: Debugger;
  didRun = false;
  get name(): string {
    return `Workflow Success Rate for "${this.workflowData.name}" (id ${this.workflowData.id})`;
  }

  constructor(
    public interval: Interval,
    public workflowData: WorkflowData,
    public workflowRunOptions?: FetchWorkflowRunsOptions
  ) {
    this.debug = debug.extend('metrics:workflow-run-success');
  }

  get summary(): string {
    if (!this.didRun) {
      throw new Error(`Cannot get sumary before calling run()`);
    }
    if (this.data.length === 0) {
      return `No completed runs found.`;
    }

    let success = this.data.filter((d) => d.conclusion === 'success').length;
    let total = this.data.length;
    let percent = (100 * (success / total)).toFixed(1);
    this.debug(`Found ${this.data.length} total runs`);
    this.debug(
      `Non-success runs: ${JSON.stringify(
        this.data.filter((d) => d.conclusion !== 'success')
      )}`
    );
    return `${percent}% Succeeded (${success}/${total})`;
  }

  async run(): Promise<void> {
    await this.load();
    this.didRun = true;
  }

  private async load(): Promise<void> {
    let options = {
      ...this.workflowRunOptions,
      status: STATUS_COMPLETED,
    };
    let { runs } = await fetchWorkflowRuns(
      this.interval,
      this.workflowData.id,
      options
    );
    this.debug(`Found ${runs.length} workflow runs for ${this.workflowData}`);
    this.data = runs.map(({ status, conclusion }) => ({ status, conclusion }));
  }
}
