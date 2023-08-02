import { MutationPayload, Plugin } from 'vuex';
import { StorageKey } from '@/config';
import { Payload, SetLocale, Source, State } from '@/store';

export function create(): Plugin<State> {
  return store => {
    store.subscribe(mutationListener);
  };
}

function mutationListener(mutation: MutationPayload) {
  const payload = <Payload>mutation.payload;

  if (payload.source === Source.App) {
    return;
  }

  if (payload instanceof SetLocale) {
    try {
      localStorage.setItem(StorageKey.LanguageSetting, payload.value);
    } catch (e) {
      console.warn('Cannot write language setting: ', e);
    }
  }
}
