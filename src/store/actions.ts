import { fromJSON, JsonClass, JsonProperty } from '@ultimicro/json-mapper';
import { UserManager } from 'oidc-client';
import { ActionContext } from 'vuex';
import { StorageKey } from '@/config';
import { GuestAccount, Session } from '@/state/session';
import { Uuid } from '@/util/uuid';
import { key } from './module';
import { SetLocale, SetSession } from './mutations';
import { Payload, Source } from './operation';
import { State } from './state';

type Context = ActionContext<State, State>;

export const enum Action {
  LoadLocalSettings = 'loadLocalSettings',
  RefreshSession = 'refreshSession'
}

export class LoadLocalSettings extends Payload {
  constructor(source: Source) {
    super(key(Action.LoadLocalSettings), source);
  }
}

export class RefreshSession extends Payload {
  constructor(source: Source) {
    super(key(Action.RefreshSession), source);
  }
}

export function buildActionTable(auth: UserManager) {
  return {
    [Action.LoadLocalSettings]: function (context: Context) {
      let saved: string | null;

      // locale
      if ((saved = localStorage.getItem(StorageKey.LanguageSetting)) !== null) {
        context.commit(new SetLocale(Source.App, saved));
      }
    },
    [Action.RefreshSession]: async function (context: Context) {
      // load stored account
      let account = await auth.getUser();
      let guest;

      if (account) {
        if (!compareAuthScope(account.scope, auth.settings.scope!)) {
          // force sign out to let user sign in again to update scope
          account = null;
        } else if (account.expired) {
          if (account.refresh_token) {
            try {
              account = await auth.signinSilent();
            } catch (e) {
              // TODO: display error
              account = null;
            }
          } else {
            // we don't support silent renew method other than refresh token
            account = null;
          }
        }

        if (account) {
          guest = GuestAccount.load();
        } else {
          // do not load guest session to confuse the user who already have an account
          guest = null;
        }
      } else {
        guest = GuestAccount.load();
      }

      // fetch user info
      if (account) {
        const url = await auth.metadataService.getUserInfoEndpoint();
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + account.access_token
          }
        });

        if (!res.ok) {
          throw new Error(`Cannot fetch user info from ${url}.`);
        }

        const json = await res.json();
        const info = fromJSON(json, UserInfo);
        const profile = account.profile;

        profile.email = info.email;
        profile.email_verified = info.email_verified;
      }

      // commit state
      let session;

      if (account) {
        session = new Session(guest, account);
      } else if (guest) {
        session = new Session(guest, null);
      } else {
        session = null;
      }

      const mutation = new SetSession(Source.App, session);

      context.commit(mutation, { root: true });
    }
  };
}

@JsonClass()
class UserInfo {
  @JsonProperty()
  sub: Uuid;

  @JsonProperty({ optional: true })
  preferred_username?: string;

  @JsonProperty()
  name: string;

  @JsonProperty()
  email: string;

  @JsonProperty()
  email_verified: boolean;

  constructor(sub: Uuid, preferred_username: string | undefined, name: string, email: string, email_verified: boolean) {
    this.sub = sub;
    this.preferred_username = preferred_username;
    this.name = name;
    this.email = email;
    this.email_verified = email_verified;
  }
}

function compareAuthScope(first: string, second: string): boolean {
  const left = first.split(/\s+/).sort().join(' ');
  const right = second.split(/\s+/).sort().join(' ');

  return left === right;
}
