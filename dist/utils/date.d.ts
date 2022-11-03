import { Interval } from 'luxon';
export declare enum Period {
    DAY = "day",
    WEEK = "week",
    MONTH = "month"
}
export declare function stringToPeriod(str: string): Period;
export declare function getInterval(period?: Period): Interval;
