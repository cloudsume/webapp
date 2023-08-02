import { parse } from 'bcp-47';
import { lookup } from 'bcp-47-match';
import { eq } from 'binary-search-bounds';

export const FallbackLanguage = 'en-US';

// list of all supported languages, must be sorted by tag, in case-insensitive; due to we use binary search on it
export const Languages: Language[] = [
  {
    tag: 'en',
    name: {
      en: 'English',
      th: 'อังกฤษ'
    }
  },
  {
    tag: 'en-IN',
    name: {
      en: 'English (India)',
      th: 'อังกฤษ (อินเดีย)'
    }
  },
  {
    tag: 'en-SG',
    name: {
      en: 'English (Singapore)',
      th: 'อังกฤษ (สิงคโปร์)'
    }
  },
  {
    tag: 'en-TH',
    name: {
      en: 'English (Thailand)',
      th: 'อังกฤษ (ไทย)'
    }
  },
  {
    tag: 'en-US',
    name: {
      en: 'English (United States)',
      th: 'อังกฤษ (สหรัฐอเมริกา)'
    }
  },
  {
    tag: 'hi',
    name: {
      en: 'Hindi',
      th: 'ฮินดี'
    }
  },
  {
    tag: 'th',
    name: {
      en: 'Thai',
      th: 'ไทย'
    }
  },
  {
    tag: 'th-TH',
    name: {
      en: 'Thai (Thailand)',
      th: 'ไทย (ไทย)'
    }
  }
];

export function selectApplicationLanguage(preferred: string): string {
  const selected = lookup(Tags, preferred);

  switch (selected) {
    case 'en':
      return 'en-US';
    case 'th':
      return 'th-TH';
    case undefined:
      return FallbackLanguage;
    default:
      return selected;
  }
}

export function getLanguageName(tag: string, lang: string): string {
  // locate language data
  const data = findLanguage(tag);

  if (data === undefined) {
    throw new Error(`Unknow language ${tag}.`);
  }

  // get result's language
  const { language } = parse(lang);

  if (language === undefined) {
    throw new Error(`Unsupported language ${lang}.`);
  }

  // locate name
  const name = data.name[language.toLowerCase()];

  if (name === undefined) {
    throw new Error(`Language '${tag}' does not have name in language '${language}'.`);
  }

  return name;
}

export function getLanguageFamily(tag: string): string {
  const l = parse(tag).language;

  if (l === undefined) {
    throw new Error(`'${tag}' is not a valid language tag.`);
  }

  return l;
}

export function getLanguageRegion(tag: string): string {
  const r = parse(tag).region;

  if (r === undefined) {
    throw new Error(`'${tag}' is not a valid language tag.`);
  }

  return r;
}

export function getParentLanguage(tag: string): string | null {
  if (tag.length) {
    const sep = tag.lastIndexOf('-');

    if (sep === -1) {
      return '';
    } else {
      return tag.substring(0, sep);
    }
  } else {
    return null;
  }
}

/**
 * Get language tree of the specified language tag.
 *
 * @param tag Language tag to get language tree.
 *
 * @returns The language tree of the specified tag, in least specific to more specific order (e.g. "" > "en" > "en-US").
 */
export function getLanguageTree(tag: string): string[] {
  const tree = new Array<string>();

  for (let l: string | null = tag; l !== null; l = getParentLanguage(l)) {
    tree.push(l);
  }

  return tree.reverse();
}

export function getCommonLanguage(tag1: string, tag2: string): string {
  // generate tree for tag1
  const tree = new Set<string>();

  for (let l: string | null = tag1; l !== null; l = getParentLanguage(l)) {
    tree.add(l);
  }

  // iterate tree of tag2
  for (let l: string | null = tag2; l != null; l = getParentLanguage(l)) {
    if (tree.has(l)) {
      return l;
    }
  }

  // this should never happen
  throw new Error(`Unable to find common language for '${tag1}' and '${tag2}'.`);
}

export interface Language {
  tag: string;
  name: {
    [lang: string]: string
  };
}

const Tags = Languages.map(l => l.tag);

function findLanguage(tag: string): Language | undefined {
  const i = eq(Tags, tag, (a, b) => a.localeCompare(b, undefined, { sensitivity: 'accent' }));

  if (i === -1) {
    return undefined;
  } else {
    return Languages[i];
  }
}
