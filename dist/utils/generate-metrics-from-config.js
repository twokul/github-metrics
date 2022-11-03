"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMetrics = exports.findIncludedWorkflows = void 0;
const metric_1 = require("../metric");
const assert_1 = require("assert");
const date_1 = require("./date");
const debug_1 = require("./debug");
const DEFAULT_PERIOD = date_1.Period.WEEK;
const debug = debug_1.default.extend('generate-metrics-from-config');
function shouldIncludeWorkflow(workflow, config) {
    var _a, _b, _c, _d;
    let excludedPaths = (_b = (_a = config.exclude) === null || _a === void 0 ? void 0 : _a.paths) !== null && _b !== void 0 ? _b : [];
    let includedPaths = (_d = (_c = config.include) === null || _c === void 0 ? void 0 : _c.paths) !== null && _d !== void 0 ? _d : [];
    let isExplicitlyExcluded = excludedPaths.some((path) => path === workflow.path);
    let isExplicitlyIncluded = includedPaths.some((path) => path === workflow.path);
    if (config.include && config.exclude) {
        // When both include and exclude are passed, only include matches that are
        // in the include set and not excluded by the exclude set
        return isExplicitlyIncluded && !isExplicitlyExcluded;
    }
    else if (config.exclude) {
        // When only exclude is passed, only explicitly excluded items are omitted
        return !isExplicitlyExcluded;
    }
    else if (config.include) {
        // When only include is passed, only explicitly included items are included
        return isExplicitlyIncluded;
    }
    else {
        // If neither include and exclude were passed, include all items
        return true;
    }
}
// Workflow-related metrics accept different args in their constructors and have
// different possible config options than other metrics, so it is useful to know
// if the metric name corresponds to a workflow-related metric.
function isWorkflowMetric(metricName) {
    return metricName.startsWith('workflow');
}
// Given a list of workflows and a config,
// find the workflows that should be included for
// the particular metric, based on their path and
// the include/exclude paths options
function findIncludedWorkflows(workflows, config) {
    return workflows.filter((workflow) => shouldIncludeWorkflow(workflow, config));
}
exports.findIncludedWorkflows = findIncludedWorkflows;
function getIntervalFromConfig(config) {
    const period = config.period ? date_1.stringToPeriod(config.period) : DEFAULT_PERIOD;
    return date_1.getInterval(period);
}
// Given a config object, and a list of all known workflows,
// generate instances of all the `Metric`s that are specified
// in the config.
// @public
function generateMetrics(config, allWorkflows = []) {
    validateConfig(config);
    const interval = getIntervalFromConfig(config);
    debug(`Got interval: ${interval.toString()}`);
    let metricConfigs = config['metrics'] || [];
    let metrics = [];
    for (let config of metricConfigs) {
        let { name } = config;
        let ctor = metric_1.METRIC_NAME_TO_CONSTRUCTOR[name];
        if (isWorkflowMetric(name)) {
            let workflows = findIncludedWorkflows(allWorkflows, config);
            debug(`For metric "${name}", config: %o, filtered ${allWorkflows.length} -> ${workflows.length} workflows: %o`, config, workflows.map(({ path }) => path));
            let options = config.options || {};
            workflows.forEach((workflow) => {
                let metric = new ctor(interval, workflow, options);
                metrics.push(metric);
            });
        }
        else {
            let metric = new ctor(interval);
            metrics.push(metric);
        }
    }
    return metrics;
}
exports.generateMetrics = generateMetrics;
// Validates the the config passed is a valid MetricsConfig
// object. Throws if any errors are found.
// @private
function validateConfig(config) {
    let allowedKeys = ['period', 'metrics'];
    let invalidKeys = Object.keys(config).filter((key) => !allowedKeys.includes(key));
    assert_1.strict(invalidKeys.length === 0, `Invalid configuration: invalid key(s): "${invalidKeys.join(', ')}"`);
    if (config.period) {
        validatePeriod(config.period);
    }
    let metricConfigs = config.metrics || [];
    metricConfigs.forEach((metricConfig) => validateMetricConfig(metricConfig));
}
// @private
function validatePeriod(str) {
    try {
        date_1.stringToPeriod(str);
    }
    catch (e) {
        throw new Error(`Invalid configuration: Period "${str}" is not valid`);
    }
}
// Validates the the particular config object for the metric
// is valid. Throws if any errors are found
// @private
function validateMetricConfig(metricConfig) {
    let { name } = metricConfig;
    assert_1.strict(name, `Invalid configuration must include name`);
    assert_1.strict(name in metric_1.METRIC_NAME_TO_CONSTRUCTOR, `Invalid configuration. Unknown metric name "${name}"`);
    let _isWorkflowMetric = isWorkflowMetric(name);
    let allowedKeys;
    if (_isWorkflowMetric) {
        allowedKeys = ['name', 'include', 'exclude', 'options'];
    }
    else {
        allowedKeys = ['name'];
    }
    let invalidKeys = Object.keys(metricConfig).filter((key) => !allowedKeys.includes(key));
    assert_1.strict(invalidKeys.length === 0, `Invalid configuration keys: ${invalidKeys.join(', ')}, only these keys allowed: ${allowedKeys.join(', ')}`);
    if (_isWorkflowMetric) {
        for (let matcherKey of ['include', 'exclude']) {
            if (metricConfig[matcherKey]) {
                assert_1.strict(Object.keys(metricConfig[matcherKey]).length === 1 &&
                    Array.isArray(metricConfig[matcherKey].paths), `Invalid configuration: Only "paths" array property is allowed for "${matcherKey}"`);
            }
        }
    }
}
