export const TAB = '    ';
export function indent(count: number, input: string): string;
export function indent(count: number, input: string[]): string[];
export function indent(
  count: number,
  input: string | string[]
): string | string[] {
  if (Array.isArray(input)) {
    return input.map((str) => indent(count, str));
  } else {
    return TAB.repeat(count) + input;
  }
}
