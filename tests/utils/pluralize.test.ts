import { pluralize } from '../../src/utils/pluralize';

describe('pluralize', () => {
  test('basic usage', () => {
    expect(pluralize('abc', 2)).toEqual('abcs');
    expect(pluralize('abc Def', 2)).toEqual('abc Defs');
    expect(pluralize('abc Def', 1)).toEqual('abc Def');
    expect(pluralize('abc Def', 0)).toEqual('abc Defs');
  });

  test('interpolated count', () => {
    expect(pluralize('%d abc', 2)).toEqual('2 abcs');
    expect(pluralize('%d abc Def', 2)).toEqual('2 abc Defs');
    expect(pluralize('%d abc Def', 1)).toEqual('1 abc Def');
    expect(pluralize('%d abc Def', 0)).toEqual('0 abc Defs');

    expect(pluralize('%d abc %d Def', 33)).toEqual('33 abc 33 Defs');
    expect(pluralize('abc %d Def', 33)).toEqual('abc 33 Defs');
  });
});
