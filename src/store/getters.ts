import { State } from './state';

export const enum Getter {
  SessionType = 'sessionType'
}

export const enum SessionType {
  Guest = 'guest',
  Candidate = 'candidate'
}

export function buildGetterTable() {
  return {
    [Getter.SessionType]: function (state: State) {
      const session = state.session;

      if (!session) {
        return SessionType.Guest;
      }

      return SessionType.Candidate;
    }
  };
}
