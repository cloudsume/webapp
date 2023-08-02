import { parse } from 'bcp-47';

export function isAllowedAlphabets(value: string, lang: string): boolean {
  if (!lang) {
    // invariant culture
    return validateCharacters(value, isEnglish);
  }

  switch (parse(lang).language) {
    case 'en':
      return validateCharacters(value, isEnglish);
    case 'th':
      return validateCharacters(value, c => isEnglish(c) || isThai(c));
    default:
      throw new Error(`Unsupported language ${lang}.`);
  }
}

function validateCharacters(v: string, p: (c: number) => boolean): boolean {
  for (let i = 0; i < v.length; i++) {
    const c = v.codePointAt(i)!;

    if (!p(c)) {
      return false;
    }

    // skip 2 characters if the code point is a surrogate pair
    if (c > 0xFFFF) {
      i++;
    }
  }

  return true;
}

function isEnglish(c: number): boolean {
  return c <= 0x007F;
}

function isThai(c: number): boolean {
  return c >= 0x0E00 && c <= 0x0E5B;
}
