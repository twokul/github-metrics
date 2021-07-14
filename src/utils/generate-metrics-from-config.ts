import { Metric, METRIC_NAME_TO_CONSTRUCTOR } from '../metric';
import { WorkflowData } from './api-requests';
import { strict as assert } from 'assert';
import { getInterval, Period, stringToPeriod } from './date';
import debugBase from './debug';

const DEFAULT_PERIOD = Period.WEEK;

const debug = debugBase.extend('generate-metrics-from-config');

// This is the schema of the config yml file.
export type MetricsConfig = {
  period?: string;
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
  let excludedPaths = config.exclude?.paths ?? [];
  let includedPaths = config.include?.paths ?? [];
  let isExplicitlyExcluded = excludedPaths.some(
    (path) => path === workflow.path
  );
  let isExplicitlyIncluded = includedPaths.some(
    (path) => path === workflow.path
  );

  if (config.include && config.exclude) {
    // When both include and exclude are passed, only include matches that are
    // in the include set and not excluded by the exclude set
    return isExplicitlyIncluded && !isExplicitlyExcluded;
  } else if (config.exclude) {
    // When only exclude is passed, only explicitly excluded items are omitted
    return !isExplicitlyExcluded;
  } else if (config.include) {
    // When only include is passed, only explicitly included items are included
    return isExplicitlyIncluded;
  } else {
    // If neither include and exclude were passed, include all items
    return true;
  }
}

// Workflow-related metrics accept different args in their constructors and have
// different possible config options than other metrics, so it is useful to know
// if the metric name corresponds to a workflow-related metric.
function isWorkflowMetric(metricName: string) {
  return metricName.startsWith('workflow');
}

// Given a list of workflows and a config,
// find the workflows that should be included for
// the particular metric, based on their path and
// the include/exclude paths options
export function findIncludedWorkflows(
  workflows: WorkflowData[],
  config: WorkflowConfig
) {
  return workflows.filter((workflow) =>
    shouldIncludeWorkflow(workflow, config)
  );
}

function getIntervalFromConfig(config: MetricsConfig) {
  const period = config.period ? stringToPeriod(config.period) : DEFAULT_PERIOD;
  return getInterval(period);
}

// Given a config object, and a list of all known workflows,
// generate instances of all the `Metric`s that are specified
// in the config.
// @public
export function generateMetrics(
  config: MetricsConfig,
  allWorkflows: WorkflowData[] = []
): Metric[] {
  validateConfig(config);

  const interval = getIntervalFromConfig(config);

  debug(`Got interval: ${interval.toString()}`);

  let metricConfigs = config['metrics'] || [];

  let metrics: Metric[] = [];

  for (let config of metricConfigs) {
    let { name } = config;
    let ctor = METRIC_NAME_TO_CONSTRUCTOR[name];

    if (isWorkflowMetric(name)) {
      let workflows = findIncludedWorkflows(allWorkflows, config);
      debug(
        `For metric "${name}", config: %o, filtered ${allWorkflows.length} -> ${workflows.length} workflows: %o`,
        config,
        workflows.map(({ path }) => path)
      );
      let options = config.options || {};

      workflows.forEach((workflow) => {
        let metric = new ctor(interval, workflow, options);
        metrics.push(metric);
      });
    } else {
      let metric = new ctor(interval);
      metrics.push(metric);
    }
  }

  return metrics;
}

// Validates the the config passed is a valid MetricsConfig
// object. Throws if any errors are found.
// @private
function validateConfig(config: any): void {
  let allowedKeys = ['period', 'metrics'];
  let invalidKeys = Object.keys(config).filter(
    (key) => !allowedKeys.includes(key)
  );

  assert(
    invalidKeys.length === 0,
    `Invalid configuration: invalid key(s): "${invalidKeys.join(', ')}"`
  );

  if (config.period) {
    validatePeriod(config.period);
  }

  let metricConfigs = config.metrics || [];
  metricConfigs.forEach((metricConfig: any) =>
    validateMetricConfig(metricConfig)
  );
}

// @private
function validatePeriod(str: string): void {
  try {
    stringToPeriod(str);
  } catch (e) {
    throw new Error(`Invalid configuration: Period "${str}" is not valid`);
  }
}

// Validates the the particular config object for the metric
// is valid. Throws if any errors are found
// @private
function validateMetricConfig(metricConfig: any): void {
  let { name } = metricConfig;
  assert(name, `Invalid configuration must include name`);

  assert(
    name in METRIC_NAME_TO_CONSTRUCTOR,
    `Invalid configuration. Unknown metric name "${name}"`
  );

  let _isWorkflowMetric = isWorkflowMetric(name);

  let allowedKeys: string[];
  if (_isWorkflowMetric) {
    allowedKeys = ['name', 'include', 'exclude', 'options'];
  } else {
    allowedKeys = ['name'];
  }

  let invalidKeys = Object.keys(metricConfig).filter(
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
      if (metricConfig[matcherKey]) {
        assert(
          Object.keys(metricConfig[matcherKey]).length === 1 &&
            Array.isArray(metricConfig[matcherKey].paths),
          `Invalid configuration: Only "paths" array property is allowed for "${matcherKey}"`
        );
      }
    }
  }
}
