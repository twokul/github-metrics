import durationToHuman from '../../src/utils/duration-to-human';
import { Duration } from 'luxon';

describe('utils:durationToHuman', () => {
  test('formats correctly', () => {
    expect(
      durationToHuman(
        Duration.fromObject({ days: 2, hours: 1, minutes: 10, seconds: 25 })
      )
    ).toBe('2 days 1 hour');

    expect(
      durationToHuman(
        Duration.fromObject({ days: 0, hours: 1, minutes: 10, seconds: 25 })
      )
    ).toBe('1 hour 10 minutes');

    expect(
      durationToHuman(
        Duration.fromObject({ days: 0, hours: 0, minutes: 10, seconds: 25 })
      )
    ).toBe('10 minutes');

    expect(
      durationToHuman(
        Duration.fromObject({ days: 0, hours: 0, minutes: 0, seconds: 25 })
      )
    ).toBe('25 seconds');
  });
});
