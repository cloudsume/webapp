/**
 * Get country code from ISO 3166-2 value.
 *
 * @param div The ISO 3166-2 value.
 *
 * @returns Country code of the specified value.
 */
export function getCountryCode(div: string): string {
  const i = div.indexOf('-');
  let c;

  if (i === -1 || (c = div.substring(0, i)).length !== 2) {
    throw new Error(`'${div}' is not a valid ISO 3166-2 code.`);
  }

  return c;
}
