import { DateTime, Duration } from 'luxon';
import debug, { Debugger } from '../utils/debug';

// Possible values for "status" and "conclusion" are listed in Github's docs here:
// https://docs.github.com/en/rest/reference/checks#create-a-check-run
export type STATUS_TYPE = 'queued' | 'in_progress' | 'completed';
export type CONCLUSION_TYPE =
  | 'action_required'
  | 'cancelled'
  | 'failure'
  | 'neutral'
  | 'success'
  | 'skipped'
  | 'stale'
  | 'timed_out';

export interface WorkflowRunData {
  id: number;
  status: STATUS_TYPE;
  conclusion: CONCLUSION_TYPE;
  workflow_id: number;
  check_suite_id: number;
  created_at: string;
  updated_at: string;
}

export class WorkflowRun {
  id: number;
  debug: Debugger;
  status: STATUS_TYPE;
  conclusion: CONCLUSION_TYPE;
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
