"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableDebugging = void 0;
const debug_1 = require("debug");
const debug = debug_1.default('github-metrics');
function enableDebugging() {
    debug_1.default.enable('github-metrics:*');
}
exports.enableDebugging = enableDebugging;
exports.default = debug;
