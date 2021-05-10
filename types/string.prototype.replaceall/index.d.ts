declare module 'string.prototype.replaceall' {
  /**
   * Returns a new string with all matches of a pattern replaced by a
   * replacement. The pattern can be a string or a RegExp, and the replacement
   * can be a string or a function to be called for each match.
   * 
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll
   * 
   * @param str
   * @param pattern 
   * @param replacement 
   */
  export default function replaceAll(
    str: string,
    pattern: string | RegExp,
    replacement: string
  ): string;
}
