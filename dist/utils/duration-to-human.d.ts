import { Duration } from 'luxon';
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
 *   durationToHuman(Duration.fromObject({minutes:10, seconds:30})) -> "10 minutes, 30 seconds"
 *   durationToHuman(Duration.fromObject({seconds:30})) -> "30 seconds"
 */
export declare function durationToHuman(duration: Duration): string;
export declare function millisToHuman(millis: number): string;
