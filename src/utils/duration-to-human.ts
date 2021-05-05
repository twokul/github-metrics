import { Duration } from 'luxon';

export default function durationToHuman(duration: Duration): string {
  let out = '';

  let days = duration.as('days');
  let minutes = duration.as('minutes');
  let hours = duration.as('hours');
  let seconds = duration.as('seconds');

  if (days > 0) {
    out += `${days} day${days !== 1 && 's'}`;
    out += `${hours} hour${hours !== 1 && 's'}`;
  } else if (hours > 0) {
    out += `${hours} hour${hours !== 1 && 's'}`;
    out += `${minutes} minute${minutes !== 1 && 's'}`;
  } else if (minutes > 0) {
    out += `${minutes} minute${minutes !== 1 && 's'}`;
  } else {
    out += `${seconds} second${seconds !== 1 && 's'}`;
  }

  return out;
}
