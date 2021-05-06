global.td = require('testdouble');
require('testdouble-jest')(td, jest);

process.env.GITHUB_OWNER = 'bantic';
process.env.GITHUB_REPO = 'github-metrics-tests';

if (process.env.RECORD_REQUESTS) {
  if (!process.env.GITHUB_RECORDING_TOKEN) {
    throw new Error('Missing required process.env.GITHUB_RECORDING_TOKEN');
  }
  process.env.GITHUB_TOKEN = process.env.GITHUB_RECORDING_TOKEN;
} else {
  process.env.GITHUB_TOKEN = '*****';
}
