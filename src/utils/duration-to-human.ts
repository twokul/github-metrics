import { Duration } from 'luxon';
import { pluralize } from './pluralize';

/**
 * Returns a human-readable string representation of the duration.
 * This scales the output to omit small parts of the duration if larger parts are present.
 *
 * For example, if the duration can be measured in days, this function returns the days and hours
 * (but not minutes or seconds).
 * If the duration is less than a day, returns the duration in hours and minutes (but not seconds).
 * Only returns seconds if the duration is less than a minute.
 *
 * Examples:
 *   durationToHuman(Duration.fromObject({days:5, hours:2,minutes:1, seconds:30})) -> "5 days 2 hours"
 *   durationToHuman(Duration.fromObject({hours:2,minutes:1, seconds:30})) -> "2 hours 1 minute"
 *   durationToHuman(Duration.fromObject({minutes:10, seconds:30})) -> "10 minutes"
 *   durationToHuman(Duration.fromObject({seconds:30})) -> "30 seconds"
 */
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
