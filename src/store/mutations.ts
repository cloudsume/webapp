import { Session } from '@/state/session';
import { key } from './module';
import { Source, Payload } from './operation';
import { AlertData, State } from './state';

export const enum Mutation {
  SetLocale = 'setLocale',
  AddAlert = 'addAlert',
  RemoveAlert = 'removeAlert',
  SetSession = 'setSession'
}

export class SetLocale extends Payload {
  constructor(source: Source, readonly value: string) {
    super(key(Mutation.SetLocale), source);
  }
}

export class AddAlert extends Payload {
  constructor(source: Source, readonly alert: AlertData) {
    super(key(Mutation.AddAlert), source);
  }
}

export class RemoveAlert extends Payload {
  constructor(source: Source, readonly alert?: number | string) {
    super(key(Mutation.RemoveAlert), source);
  }
}

export class SetSession extends Payload {
  constructor(source: Source, readonly session: Session | null) {
    super(key(Mutation.SetSession), source);
  }
}

export function buildMutationTable() {
  return {
    [Mutation.SetLocale]: function (state: State, payload: SetLocale) {
      state.locale = payload.value;
    },
    [Mutation.AddAlert]: function (state: State, payload: AddAlert) {
      state.alerts.push(payload.alert);
    },
    [Mutation.RemoveAlert]: removeAlert,
    [Mutation.SetSession]: function (state: State, payload: SetSession) {
      state.session = payload.session;
    }
  };
}

function removeAlert(state: State, payload: RemoveAlert) {
  if (payload.alert === undefined) {
    state.alerts = [];
    return;
  }

  let index;

  if (typeof payload.alert === 'string') {
    index = state.alerts.findIndex(a => a.id === payload.alert);
    if (index === -1) {
      throw new Error(`Unknow alert ${payload.alert}.`);
    }
  } else {
    index = payload.alert;
  }

  state.alerts.splice(index, 1);
}
