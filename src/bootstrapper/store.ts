import { UserManager } from 'oidc-client';
import { Store } from 'vuex';
import { isProduction } from '@/config';
import { create as createSessionRemover } from '@/plugins/session-remover';
import { create as createSettingSaver } from '@/plugins/setting-saver';
import { buildActionTable, buildGetterTable, buildMutationTable, createState, LoadLocalSettings, Source, State } from '@/store';

export function create(idp: UserManager): Store<State> {
  const store = new Store<State>({
    state: createState,
    mutations: buildMutationTable(),
    getters: buildGetterTable(),
    actions: buildActionTable(idp),
    plugins: [
      createSettingSaver(),
      createSessionRemover(idp)
    ],
    strict: !isProduction()
  });

  store.dispatch(new LoadLocalSettings(Source.App));

  return store;
}
