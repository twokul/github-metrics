global.td = require('testdouble');
require('testdouble-jest')(td, jest);

if (process.env.RECORD_REQUESTS) {
  for (let requiredEnvVar of ['GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_TOKEN']) {
    if (!process.env[requiredEnvVar]) {
      throw new Error(`Missing required process.env.${requiredEnvVar}`);
    }
  }
} else {
  process.env.GITHUB_OWNER = 'bantic';
  process.env.GITHUB_REPO = 'github-metrics-tests';
  process.env.GITHUB_TOKEN = '*****';
}
