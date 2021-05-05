import percentiles from '../../src/utils/percentiles';
import { Duration } from 'luxon';

describe('utils:percentiles', () => {
  test('returns the requested percentiles', () => {
    expect(percentiles([0], [3, 2, 1])).toStrictEqual([1]);
    expect(percentiles([100], [3, 2, 1])).toStrictEqual([3]);
    expect(percentiles([0, 100], [3, 2, 1])).toStrictEqual([1, 3]);
    expect(percentiles([100, 0], [3, 2, 1])).toStrictEqual([3, 1]);
    expect(percentiles([50], [3, 2, 1])).toStrictEqual([2]);
  });

  test('validates that percentiles are numeric and in range', () => {
    expect(() => percentiles([-1], [3, 2, 1])).toThrowError();
    expect(() => percentiles([101], [3, 2, 1])).toThrowError();
  });

  test('validates that data is numeric', () => {
    expect(() => percentiles([50], [NaN])).toThrowError();
    expect(() => percentiles([50], [undefined])).toThrowError();
    expect(() => percentiles([50], [null])).toThrowError();
  });

  test('throws if no data is given', () => {
    expect(() => percentiles([50], [])).toThrowError();
  });
});
