import { LocaleMessageObject, Values } from 'vue-i18n';
import { I18n } from '@/services';
import { inject } from '@/util/injector';

export function useTranslation() {
  const i18n = inject(I18n);

  return {
    t: function (key: string, values?: Values): string {
      const r = i18n.t(key, values);

      if (typeof r !== 'string') {
        throw new Error();
      }

      return r;
    },
    d: function (value: Date, format: 'short'): string {
      return i18n.d(value, format);
    }
  };
}

export async function loadTranslation(lang: string): Promise<LocaleMessageObject> {
  switch (lang) {
    case 'en-US':
      return await import(/* webpackChunkName: "en-US" */ '@/translations/en-US.json');
    case 'th-TH':
      return await import(/* webpackChunkName: "th-TH" */ '@/translations/th-TH.json');
    default:
      throw new Error(`Unknow language '${lang}'.`);
  }
}
