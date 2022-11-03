/**
 * Naive pluralization
 */
export function pluralize(str: string, val: number): string {
  str = val === 1 ? str : str + 's';

  // string.replaceAll not yet available
  while (str.includes('%d')) {
    str = str.replace('%d', val.toString());
  }

  return str;
}
