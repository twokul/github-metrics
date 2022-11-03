"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterval = exports.stringToPeriod = exports.Period = void 0;
const luxon_1 = require("luxon");
var Period;
(function (Period) {
    Period["DAY"] = "day";
    Period["WEEK"] = "week";
    Period["MONTH"] = "month";
})(Period = exports.Period || (exports.Period = {}));
function stringToPeriod(str) {
    switch (str) {
        case 'day':
            return Period.DAY;
        case 'week':
            return Period.WEEK;
        case 'month':
            return Period.MONTH;
        default:
            throw new Error(`Unexected Period: ${str}`);
    }
}
exports.stringToPeriod = stringToPeriod;
function getInterval(period = Period.DAY) {
    const end = luxon_1.DateTime.utc();
    const start = end.minus({ [period]: 1 });
    return luxon_1.Interval.fromDateTimes(start, end);
}
exports.getInterval = getInterval;
