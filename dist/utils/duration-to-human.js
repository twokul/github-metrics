"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.millisToHuman = exports.durationToHuman = void 0;
const luxon_1 = require("luxon");
const pluralize_1 = require("./pluralize");
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
function durationToHuman(duration) {
    duration = duration.shiftTo('days', 'hours', 'minutes', 'seconds');
    let days = duration.get('days');
    let minutes = duration.get('minutes');
    let hours = duration.get('hours');
    let seconds = duration.get('seconds');
    let parts = [];
    if (days > 0) {
        parts.push(`${days} ${pluralize_1.pluralize('day', days)}`);
        parts.push(`${hours} ${pluralize_1.pluralize('hour', hours)}`);
    }
    else if (hours > 0) {
        parts.push(`${hours} ${pluralize_1.pluralize('hour', hours)}`);
        parts.push(`${minutes} ${pluralize_1.pluralize('minute', minutes)}`);
    }
    else if (minutes > 0) {
        parts.push(`${minutes} ${pluralize_1.pluralize('minute', minutes)}`);
        parts.push(`${seconds} ${pluralize_1.pluralize('second', seconds)}`);
    }
    else {
        parts.push(`${seconds} ${pluralize_1.pluralize('second', seconds)}`);
    }
    return parts.join(' ');
}
exports.durationToHuman = durationToHuman;
function millisToHuman(millis) {
    return durationToHuman(luxon_1.Duration.fromMillis(millis));
}
exports.millisToHuman = millisToHuman;
