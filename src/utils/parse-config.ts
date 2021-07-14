import { parse } from 'yaml';
import { Metric } from '../metric';
import { WorkflowData, fetchWorkflows } from './api-requests';
import { strict as assert } from 'assert';
import { getInterval, Period } from './date';
import WorkflowDurationMetric from '../metrics/workflow-duration';
import WorkflowSuccessMetric from '../metrics/workflow-success';
import TimeToMergeMetric from '../metrics/time-to-merge';
import MergedPRsMetric from '../metrics/merged-prs';

export const METRIC_NAME_TO_CONSTRUCTOR: {
  [key: string]: new (...args: any[]) => Metric;
} = {
  'workflow/duration': WorkflowDurationMetric,
  'workflow/success': WorkflowSuccessMetric,
  'pull-request/time-to-merge': TimeToMergeMetric,
  'pull-request/merged': MergedPRsMetric,
};

export type ConfigOptions = {
  metrics: ({ name: string } & WorkflowConfig)[];
};

type WorkflowConfig = {
  exclude?: {
    paths: string[];
  };
  include?: {
    paths: string[];
  };
  options?: any;
};

function shouldIncludeWorkflow(
  workflow: WorkflowData,
  config: WorkflowConfig
): boolean {
  let isExplicitlyExcluded = config.exclude?.paths.some(
    (path) => path === workflow.path
  );
  let isExplicitlyIncluded = config.include?.paths.some(
    (path) => path === workflow.path
  );

  if (config.include && config.exclude) {
    // When both include and exclude are passed, only include
    // matches that are in the include set and not excluded by the
    // exclude set
    return Boolean(isExplicitlyIncluded && !isExplicitlyExcluded);
  } else if (config.exclude) {
    // When only exclude is passed, only explicitly excluded items
    // are omitted
    return !isExplicitlyExcluded;
  } else if (config.include) {
    // When only include is passed, only explicitly included
    // items are included
    return Boolean(isExplicitlyIncluded);
  } else {
    // If neither include and exclude were passed,
    // by default include all
    return true;
  }
}

function isWorkflowMetric(metricName: string): boolean {
  return metricName.startsWith('workflow');
}

export function findIncludedWorkflows(
  workflows: WorkflowData[],
  config: WorkflowConfig
) {
  return workflows.filter((workflow) =>
    shouldIncludeWorkflow(workflow, config)
  );
}

export function generateMetrics(
  config: ConfigOptions,
  allWorkflows: WorkflowData[] = []
): Metric[] {
  const DEFAULTS = {
    interval: getInterval(Period.WEEK),
  };
  const DEFAULT_WORKFLOW_OPTIONS = {};

  let metricConfigs = config['metrics'] || [];

  let metrics: Metric[] = [];

  for (let config of metricConfigs) {
    validateConfig(config);

    let { name } = config;
    let ctor = METRIC_NAME_TO_CONSTRUCTOR[name];
    assert(ctor, `Unknown metric with name "${name}"`);

    if (isWorkflowMetric(name)) {
      let workflows = findIncludedWorkflows(allWorkflows, config);
      let options = config.options || DEFAULT_WORKFLOW_OPTIONS;

      workflows.forEach((workflow) => {
        let metric = new ctor(DEFAULTS.interval, workflow, options);
        metrics.push(metric);
      });
    } else {
      let metric = new ctor(DEFAULTS.interval);
      metrics.push(metric);
    }
  }

  return metrics;
}

function validateConfig(config: any): void {
  let { name } = config;
  assert(name, `Invalid configuration must include name`);

  let _isWorkflowMetric = isWorkflowMetric(name);

  let allowedKeys: string[];
  if (_isWorkflowMetric) {
    allowedKeys = ['name', 'include', 'exclude', 'options'];
  } else {
    allowedKeys = ['name'];
  }

  let invalidKeys = Object.keys(config).filter(
    (key) => !allowedKeys.includes(key)
  );
  assert(
    invalidKeys.length === 0,
    `Invalid configuration keys: ${invalidKeys.join(
      ', '
    )}, only these keys allowed: ${allowedKeys.join(', ')}`
  );

  if (_isWorkflowMetric) {
    for (let matcherKey of ['include', 'exclude']) {
      if (config[matcherKey]) {
        assert(
          Object.keys(config[matcherKey]).length === 1 &&
            Array.isArray(config[matcherKey].paths),
          `Invalid configuration: Only "paths" array property is allowed for "${matcherKey}"`
        );
      }
    }
  }
}

export async function parseConfig(yml: string): Promise<Metric[]> {
  let config = parse(yml);
  let workflows = await fetchWorkflows();
  return generateMetrics(config, workflows);
}
