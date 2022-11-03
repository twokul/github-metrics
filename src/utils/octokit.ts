import { Octokit as BaseOctokit } from '@octokit/rest';
import { retry } from '@octokit/plugin-retry';

export const Octokit = BaseOctokit.plugin(retry);
