import VueI18n from 'vue-i18n';
import { createI18n } from 'vue-i18n-composable';
import { Store } from 'vuex';
import { FallbackLanguage, loadTranslation, selectApplicationLanguage } from '@/i18n';
import { DateTimeFormats, NumberFormats } from '@/locales';
import { SetLocale, Source, State } from '@/store';

export async function create(store: Store<State>): Promise<VueI18n> {
  // ensure the language is a supported one
  const language = selectApplicationLanguage(store.state.locale);

  if (language !== store.state.locale) {
    store.commit(new SetLocale(Source.App, language));
  }

  // load translation
  const i18n = createI18n({
    locale: language,
    fallbackLocale: FallbackLanguage,
    silentFallbackWarn: true,
    dateTimeFormats: DateTimeFormats,
    numberFormats: NumberFormats,
    messages: {
      [language]: await loadTranslation(language)
    }
  });

  return i18n;
}
