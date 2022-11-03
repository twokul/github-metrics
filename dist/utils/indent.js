"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indent = exports.TAB = void 0;
exports.TAB = '    ';
function indent(count, input) {
    if (Array.isArray(input)) {
        return input.map((str) => indent(count, str));
    }
    else {
        return exports.TAB.repeat(count) + input;
    }
}
exports.indent = indent;
