import { UserManager } from 'oidc-client';
import { Plugin } from 'vuex';
import { Payload, SetSession, State } from '@/store';

export function create(auth: UserManager): Plugin<State> {
  return store => store.subscribe(async mutation => {
    const payload = <Payload>mutation.payload;

    if (payload instanceof SetSession && !payload.session) {
      // do not remove guest session due to we don't want user to complaint about data loss
      try {
        await auth.removeUser();
      } catch (e) {
        console.error('cannot remove session: ', e);
      }
    }
  });
}
