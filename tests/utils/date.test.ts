import { Period, generateDateRange } from '../../src/utils/date';
import * as td from 'testdouble';
import { DateTime } from 'luxon';

describe('Date Utils', () => {
  beforeAll(() => {
    td.replace(DateTime, 'now', () => {
      return DateTime.fromISO('2021-03-11T17:35:54Z');
    });
  });

  afterAll(() => td.reset());

  test('generates correct date for day', () => {
    const { startDate, endDate } = generateDateRange();

    expect(startDate.toISODate()).toEqual('2021-03-11');
    expect(endDate.toISODate()).toEqual('2021-03-11');
  });

  test('generates correct date for week', () => {
    const { startDate, endDate } = generateDateRange(Period.WEEK);

    expect(startDate.toISODate()).toEqual('2021-03-08');
    expect(endDate.toISODate()).toEqual('2021-03-14');
  });

  test('generates correct date for month', () => {
    const { startDate, endDate } = generateDateRange(Period.MONTH);

    expect(startDate.toISODate()).toEqual('2021-03-01');
    expect(endDate.toISODate()).toEqual('2021-03-31');
  });
});
