import { indent, TAB } from '../../src/utils/indent';

describe('indent', () => {
  test('basic usage', () => {
    expect(indent(1, 'abc')).toEqual(`${TAB}abc`);

    expect(indent(1, ['abc'])).toEqual([`${TAB}abc`]);
  });
});
