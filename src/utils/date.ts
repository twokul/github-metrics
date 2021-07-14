import { DateTime, Interval } from 'luxon';

export enum Period {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export function stringToPeriod(str: string): Period {
  switch (str) {
    case 'day':
      return Period.DAY;
    case 'week':
      return Period.WEEK;
    case 'month':
      return Period.MONTH;
    default:
      throw new Error(`Unexected Period: ${str}`);
  }
}

export function getInterval(period = Period.DAY): Interval {
  const end = DateTime.utc();
  const start = end.minus({ [period]: 1 });

  return Interval.fromDateTimes(start, end);
}
