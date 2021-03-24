import { DateTime } from 'luxon';

export enum Period {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export function generateDateRange(
  period = Period.DAY
): { startDate: DateTime; endDate: DateTime } {
  const today = DateTime.now();

  const startDate = today.startOf(period);
  const endDate = today.endOf(period);

  return {
    startDate,
    endDate,
  };
}
