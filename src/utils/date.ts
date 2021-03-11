import { DateTime } from 'luxon';

export enum Period {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export function generateDateRange(period = Period.DAY): { startDate: string; endDate: string } {
  const now = DateTime.now();
  const today = now;
  const thisWeek = DateTime.fromObject({ weekNumber: now.weekNumber });
  const thisMonth = DateTime.fromObject({ month: now.month });
  let startDate = '';
  let endDate = '';

  switch (period) {
    case Period.DAY:
      startDate = today.toFormat('yyyy-MM-dd');
      endDate = today.endOf('day').toString();
      break;
    case Period.WEEK:
      startDate = thisWeek.toFormat('yyyy-MM-dd');
      endDate = thisWeek.endOf('week').toString();
      break;
    case Period.MONTH:
      startDate = thisMonth.toFormat('yyyy-MM-dd');
      endDate = thisMonth.endOf('month').toString();
      break;
  }

  return {
    startDate,
    endDate,
  };
}
