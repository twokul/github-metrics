"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.percentiles = exports.METRIC_NAME_TO_CONSTRUCTOR = void 0;
const percentiles_1 = require("./utils/percentiles");
const duration_1 = require("./metrics/workflow/duration");
const success_1 = require("./metrics/workflow/success");
const time_to_merge_1 = require("./metrics/pull-request/time-to-merge");
const merged_1 = require("./metrics/pull-request/merged");
exports.METRIC_NAME_TO_CONSTRUCTOR = {
    'workflow/duration': duration_1.default,
    'workflow/success': success_1.default,
    'pull-request/time-to-merge': time_to_merge_1.default,
    'pull-request/merged': merged_1.default,
};
function percentiles(ps, metric) {
    let data = metric.data.map((datum) => datum.value);
    return percentiles_1.default(ps, data);
}
exports.percentiles = percentiles;
