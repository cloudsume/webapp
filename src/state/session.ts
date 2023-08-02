import { User } from 'oidc-client';
import { StorageKey } from '@/config';
import { Uuid } from '@/util/uuid';

export class Session {
  readonly guest: GuestAccount | null;
  readonly account: User | null;

  constructor(guest: GuestAccount | null, account: User | null) {
    this.guest = guest;
    this.account = account;
  }

  get userId(): Uuid {
    if (this.account) {
      return new Uuid(this.account.profile.sub);
    } else if (this.guest) {
      return this.guest.id;
    } else {
      throw new Error('No available account.');
    }
  }

  get accessToken(): string {
    if (this.account) {
      return this.account.access_token;
    } else if (this.guest) {
      return this.guest.accessToken;
    } else {
      throw new Error('No available account.');
    }
  }

  get isGuest(): boolean {
    // do not check this.guest due to it is possible for a signed-in user to have a previous guest session
    return !this.account;
  }

  get verifiedEmail(): string | null {
    const profile = this.account?.profile;

    if (!profile?.email_verified) {
      return null;
    } else if (!profile.email) {
      throw new Error('No email available.');
    }

    return profile.email;
  }
}

export class GuestAccount {
  constructor(readonly id: Uuid, readonly accessToken: string) {
  }

  static load(): GuestAccount | null {
    // load stored token
    const token = localStorage.getItem(StorageKey.GuestToken);

    if (token === null) {
      return null;
    }

    // get token payload
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error(`Invalid guest session token in ${StorageKey.GuestToken}.`);
    }

    const payload = JSON.parse(decodeJWTpart(parts[1]));

    if (typeof payload !== 'object') {
      throw new Error(`Invalid guest session token in ${StorageKey.GuestToken}.`);
    }

    // get user ID
    const id = new Uuid(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);

    return new GuestAccount(id, token);
  }
}

function decodeJWTpart(p: string): string {
  // substitute characters
  let r = '';

  for (const c of p) {
    if (c === '-') {
      r += '+';
    } else if (c === '_') {
      r += '/';
    } else {
      r += c;
    }
  }

  // append padding
  while (r.length % 4 !== 0) {
    r += '=';
  }

  return atob(r);
}
