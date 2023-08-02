import { Payload as VuePayload } from 'vuex';

export const enum Source {
  User,
  Server,
  App
}

export abstract class Payload implements VuePayload {
  constructor(readonly type: string, readonly source: Source) {
  }
}
