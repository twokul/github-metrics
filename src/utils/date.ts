import { DateTime } from 'luxon';

export enum Period {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export function generateDateRange(period = Period.DAY): { startDate: string; endDate: string } {
  const today = DateTime.now();
  const startDate = today.startOf(period).toString();
  const endDate = today.endOf(period).toString();

  return {
    startDate,
    endDate,
  };
}
