/**
 * For seeing if two names are essentially the same
 *
 * @param name1 First name to compare
 * @param name2 Second name to compare
 * @returns Whether they are the same or not
 */
export function areNamesEqual(name1: string, name2: string): boolean {
  return name1.toLowerCase() === name2.toLowerCase();
}

/**
 * Accepts a raw name and makes lower case, then capitalises first letters in words
 *
 * @param name Raw name to format
 * @returns The formatted name
 */
export function formatName(name: string): string {
  return name
    .toLowerCase()
    .split('')
    .map((c, i, a) => {
      if (i == 0) {
        return c.toUpperCase();
      } else if (a[i - 1].match(/[ -_]/)) {
        return c.toUpperCase();
      } else {
        return c.toLowerCase();
      }
    })
    .reduce((s, c) => s + c, '');
}
