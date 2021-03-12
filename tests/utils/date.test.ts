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

    expect(startDate).toEqual('2021-03-11T00:00:00.000-05:00');
    expect(endDate).toEqual('2021-03-11T23:59:59.999-05:00');
  });

  test('generates correct date for week', () => {
    const { startDate, endDate } = generateDateRange(Period.WEEK);

    expect(startDate).toEqual('2021-03-08T00:00:00.000-05:00');
    expect(endDate).toEqual('2021-03-14T23:59:59.999-04:00');
  });

  test('generates correct date for month', () => {
    const { startDate, endDate } = generateDateRange(Period.MONTH);

    expect(startDate).toEqual('2021-03-01T00:00:00.000-05:00');
    expect(endDate).toEqual('2021-03-31T23:59:59.999-04:00');
  });
});
