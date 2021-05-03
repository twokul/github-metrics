import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
// import { DateTime, Interval } from 'luxon';
// import GithubMetrics from './github-metrics';
// import GithubClient from './github-client';
import { PullRequestReport } from './reports/pull-requests';

const DEFAULT_GITHUB_OWNER = 'Addepar';
const DEFAULT_GITHUB_REPO = 'Iverson';

type GithubArgs = {
  owner: string;
  repo: string;
  token: string;
};

function githubArgs(): GithubArgs {
  const owner = process.env.GITHUB_OWNER || DEFAULT_GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO || DEFAULT_GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(`Required env.GITHUB_TOKEN`);
  }

  return { owner, repo, token };
}

type CLIArgs = {
  name: string;
  start?: string;
  format?: string;
  end?: string;
  days?: string;
  number?: number;
};

// function parseInterval(args: CLIArgs): Interval {
//   let start = DateTime.fromISO(args.start);
//   if (args.end) {
//     let end = DateTime.fromISO(args.end);
//     return Interval.fromDateTimes(start, end);
//   } else if (args.days) {
//     let end = start.plus({ days: parseInt(args.days, 10) });
//     return Interval.fromDateTimes(start, end);
//   } else {
//     throw new Error(`Must provide args.end or args.days`);
//   }
// }

async function run() {
  let args = yargs(hideBin(process.argv))
    .usage(
      'Usage: $0 --name=<name> --start=<start> --end=<end> --format=<format>'
    )
    .default('name', 'pull-requests')
    .default('format', 'csv').argv as CLIArgs;

  let reportName = args.name;

  switch (reportName) {
    case 'pr-ttfi': {
      let { owner, repo } = githubArgs();
      let number = args.number!;
      let report = new PullRequestReport(owner, repo, number);
      await report.run();
    }
  }
}

run();
