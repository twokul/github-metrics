import { DateTime, Interval } from 'luxon';

export enum Period {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export function getInterval(period = Period.DAY): Interval {
  const end = DateTime.utc();
  const start = end.minus({ [period]: 1 });

  return Interval.fromDateTimes(start, end);
}
