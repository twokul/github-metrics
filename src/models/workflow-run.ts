import { DateTime, Duration } from 'luxon';
import debug, { Debugger } from '../utils/debug';

export interface WorkflowRunData {
  id: number;
  status: string;
  conclusion: string;
  workflow_id: number;
  check_suite_id: number;
  created_at: string;
  updated_at: string;
}

export class WorkflowRun {
  id: number;
  debug: Debugger;
  status: string;
  conclusion: string;
  workflowId: number;
  checkSuiteId: number;
  createdAt: DateTime;
  updatedAt: DateTime;

  constructor(public data: WorkflowRunData) {
    this.createdAt = DateTime.fromISO(data.created_at);
    this.updatedAt = DateTime.fromISO(data.updated_at);
    this.checkSuiteId = data.check_suite_id;
    this.workflowId = data.workflow_id;
    this.status = data.status;
    this.conclusion = data.conclusion;
    this.id = data.id;
    this.debug = debug.extend('workflow-run:' + this.id);
  }

  get duration(): Duration {
    return this.updatedAt.diff(this.createdAt);
  }
}
