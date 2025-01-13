import { Period, getInterval } from '../../src/utils/date';
import { DateTime } from 'luxon';

const NOW_TO_ISO = '2021-03-11T17:35:54.000Z';
const STUBBED_NOW = DateTime.fromISO(NOW_TO_ISO).toUTC();

describe('Date Utils', () => {
  let origUtc: any;
  beforeAll(() => {
    origUtc = DateTime.utc;
    DateTime.utc = () => STUBBED_NOW;
  });

  afterAll(() => {
    DateTime.utc = origUtc;
  });

  test('generates correct date for day', () => {
    const interval = getInterval();

    expect(interval.start.toISO()).toEqual('2021-03-10T17:35:54.000Z');
    expect(interval.end.toISO()).toEqual(NOW_TO_ISO);
  });

  test('generates correct date for week', () => {
    const interval = getInterval(Period.WEEK);

    expect(interval.start.toISO()).toEqual('2021-03-04T17:35:54.000Z');
    expect(interval.end.toISO()).toEqual(NOW_TO_ISO);
  });

  test('generates correct date for month', () => {
    const interval = getInterval(Period.MONTH);

    expect(interval.start.toISO()).toEqual('2021-02-11T17:35:54.000Z');
    expect(interval.end.toISO()).toEqual(NOW_TO_ISO);
  });
});
