import { Duration } from 'luxon';

function pluralize(str: string, val: number) {
  return val === 1 ? str : str + 's';
}

export default function durationToHuman(duration: Duration): string {
  let out = '';

  duration = duration.shiftTo('days', 'hours', 'minutes', 'seconds');
  let days = duration.get('days');
  let minutes = duration.get('minutes');
  let hours = duration.get('hours');
  let seconds = duration.get('seconds');

  if (days > 0) {
    out += `${days} ${pluralize('day', days)}`;
    out += ` ${hours} ${pluralize('hour', hours)}`;
  } else if (hours > 0) {
    out += `${hours} ${pluralize('hour', hours)}`;
    out += ` ${minutes} ${pluralize('minute', minutes)}`;
  } else if (minutes > 0) {
    out += `${minutes} ${pluralize('minute', minutes)}`;
  } else {
    out += `${seconds} ${pluralize('second', seconds)}`;
  }

  return out;
}
