import { DateTime, Interval, Duration } from 'luxon';

export enum Period {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export function generateDateRange(period = Period.DAY): Interval {
  const today = DateTime.now();

  const start = today.startOf(period);
  const end = today.endOf(period);
  return Interval.fromDateTimes(start, end);
}

/**
 * Returns a verbose but human-readable interval, like
 * "April 20, 2017, 11:32 AM EDT to April 28, 2017, 11:32 AM EDT"
 */
export function humanFormattedInterval(interval: Interval): string {
  let formatDateTime = (dt: DateTime) =>
    dt.toLocaleString(DateTime.DATETIME_FULL);
  return [interval.start, interval.end].map(formatDateTime).join(' to ');
}

export function humanFormattedDuration(duration: Duration): string {
  return duration.toFormat("dd 'Days', mm 'minutes', ss 'seconds'");
}
