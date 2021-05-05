import percentiles from '../../src/utils/percentiles';

describe('utils:percentiles', () => {
  test('returns the requested percentiles', () => {
    expect(percentiles([0], [3, 2, 1])).toStrictEqual([1]);
    expect(percentiles([100], [3, 2, 1])).toStrictEqual([3]);
    expect(percentiles([0, 100], [3, 2, 1])).toStrictEqual([1, 3]);
    expect(percentiles([100, 0], [3, 2, 1])).toStrictEqual([3, 1]);
    expect(percentiles([50], [3, 2, 1])).toStrictEqual([2]);
  });

  test('sorts data numerically, not lexically', () => {
    let data = [20, 5, 1000];

    // asserting that naive arr#sort gives wrong values
    expect(data.slice().sort()).toStrictEqual([1000, 20, 5]);

    expect(percentiles([0, 50, 100], data)).toStrictEqual([5, 20, 1000]);
  });

  test('validates that percentiles are numeric and in range', () => {
    expect(() => percentiles([-1], [3, 2, 1])).toThrowError();
    expect(() => percentiles([101], [3, 2, 1])).toThrowError();
  });

  test('validates that data is numeric', () => {
    expect(() => percentiles([50], [NaN])).toThrowError();
    // @ts-ignore
    expect(() => percentiles([50], [undefined])).toThrowError();
    // @ts-ignore
    expect(() => percentiles([50], [null])).toThrowError();
    // @ts-ignore
    expect(() => percentiles([50], ['0'])).toThrowError();
  });

  test('throws if no data is given', () => {
    expect(() => percentiles([50], [])).toThrowError();
  });
});
