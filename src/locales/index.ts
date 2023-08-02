import { parse as parseLanguage } from 'bcp-47';
import * as i18n from 'vue-i18n';

export * from './countries';
export * from './subdivisions';

export const DateTimeFormats: i18n.DateTimeFormats = {
  en: {
    short: {
      calendar: 'gregory',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    },
    long: {
      calendar: 'gregory',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }
  },
  th: {
    short: {
      calendar: 'gregory', // bootstrap-vue support only gregory
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    },
    long: {
      calendar: 'gregory',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }
  }
};

export const NumberFormats: i18n.NumberFormats = {
  'en-US': {
    currency: {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'symbol',
    }
  },
  'th-TH': {
    currency: {
      style: 'currency',
      currency: 'THB',
      currencyDisplay: 'symbol',
    }
  }
};

export function getDateTimeFormat(locale: string, type: 'short' | 'long'): Intl.DateTimeFormatOptions {
  // try full match first
  let format = DateTimeFormats[locale];

  if (format !== undefined) {
    return format[type];
  }

  // fallback
  const info = parseLanguage(locale);

  if (info.language === undefined || !(format = DateTimeFormats[info.language])) {
    throw new Error(`Unsupported locale ${locale}.`);
  }

  return format[type];
}
