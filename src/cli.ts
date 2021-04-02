import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { DateTime, Interval } from 'luxon';

type CLIArgs = {
  name: string;
  start: string;
  format: string;
  end?: string;
  days?: string;
};
let args = yargs(hideBin(process.argv))
  .usage(
    'Usage: $0 --name=<name> --start=<start> --end=<end> --format=<format>'
  )
  .default('format', 'csv')
  .demandOption(['name', 'start']).argv as CLIArgs;

console.log(args);

let interval = null;
let start = DateTime.fromISO(args.start);
if (args.end) {
  let end = DateTime.fromISO(args.end);
  interval = Interval.fromDateTimes(start, end);
} else if (args.days) {
  let end = start.plus({ days: parseInt(args.days, 10) });
  interval = Interval.fromDateTimes(start, end);
}
console.log('Will run report', args.name, 'for interval', interval?.toString());
