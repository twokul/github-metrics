"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Octokit = void 0;
const rest_1 = require("@octokit/rest");
const plugin_retry_1 = require("@octokit/plugin-retry");
exports.Octokit = rest_1.Octokit.plugin(plugin_retry_1.retry);
