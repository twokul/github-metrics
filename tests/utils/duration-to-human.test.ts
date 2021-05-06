import durationToHuman from '../../src/utils/duration-to-human';
import { Duration } from 'luxon';

function toDuration(obj: any) {
  let millis = Duration.fromObject(obj).toMillis();
  return Duration.fromMillis(millis);
}

describe('utils:durationToHuman', () => {
  test('formats correctly when passed millis values', () => {
    expect(
      durationToHuman(
        toDuration({ days: 2, hours: 1, minutes: 10, seconds: 25 })
      )
    ).toBe('2 days 1 hour');

    expect(
      durationToHuman(
        toDuration({ days: 0, hours: 1, minutes: 10, seconds: 25 })
      )
    ).toBe('1 hour 10 minutes');

    expect(
      durationToHuman(
        toDuration({ days: 0, hours: 0, minutes: 10, seconds: 25 })
      )
    ).toBe('10 minutes');

    expect(
      durationToHuman(
        toDuration({ days: 0, hours: 0, minutes: 0, seconds: 25 })
      )
    ).toBe('25 seconds');
  });
});
