"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateNumbers(arr) {
    for (let number of arr) {
        if (!Number.isFinite(number)) {
            throw new Error(`percentiles: Unexpected non-numeric value: ${number}`);
        }
    }
}
function validateNumbersInRange(arr, min, max) {
    for (let number of arr) {
        if (number < min) {
            throw new Error(`percentiles: Unexpected number ${number} < ${min}`);
        }
        if (number > max) {
            throw new Error(`percentiles: Unexpected number ${number} > ${max}`);
        }
    }
}
function validatePercentiles(arr) {
    validateNumbers(arr);
    validateNumbersInRange(arr, 0, 100);
}
function validateData(arr) {
    if (arr.length === 0) {
        throw new Error(`percentiles: No data`);
    }
    validateNumbers(arr);
}
function getPercentileValue(p, sortedData) {
    if (p === 0) {
        return sortedData[0];
    }
    let kIndex = Math.ceil(sortedData.length * (p / 100)) - 1;
    return sortedData[kIndex];
}
function sortNumeric(arr) {
    return arr.slice().sort((a, b) => (a < b ? -1 : a === b ? 0 : 1));
}
function percentiles(ps, unsortedData) {
    validateData(unsortedData);
    validatePercentiles(ps);
    let sortedData = sortNumeric(unsortedData);
    return ps.map((p) => getPercentileValue(p, sortedData));
}
exports.default = percentiles;
