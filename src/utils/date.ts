import { DateTime } from 'luxon';

export enum Period {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export type DateRange = {
  startDate: DateTime;
  endDate: DateTime;
};

export function generateDateRange(period = Period.DAY): DateRange {
  const today = DateTime.now();

  const startDate = today.startOf(period);
  const endDate = today.endOf(period);

  return {
    startDate,
    endDate,
  };
}
