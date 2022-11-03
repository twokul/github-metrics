"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluralize = void 0;
/**
 * Naive pluralization
 */
function pluralize(str, val) {
    str = val === 1 ? str : str + 's';
    // string.replaceAll not yet available
    while (str.includes('%d')) {
        str = str.replace('%d', val.toString());
    }
    return str;
}
exports.pluralize = pluralize;
