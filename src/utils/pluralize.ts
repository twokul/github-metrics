/**
 * Naive pluralization
 */
export function pluralize(str: string, val: number): string {
  return val === 1 ? str : str + 's';
}
