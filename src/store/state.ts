import { v4 as uuid } from 'uuid';
import { TranslateResult, Values } from 'vue-i18n';
import { Session } from '@/state/session';

export type AlertMessage = string | (() => TranslateResult);

export abstract class AlertData {
  readonly id: string;

  constructor(readonly message: AlertMessage, readonly data?: Values) {
    this.id = uuid();
  }
}

export class ErrorAlert extends AlertData {
  readonly error?: Error;

  constructor(message: AlertMessage, data?: Values);
  constructor(message: AlertMessage, error: Error);
  constructor(message: AlertMessage, arg?: Values | Error) {
    if (arg instanceof Error) {
      super(message);
      this.error = arg;
      console.error(arg);
    } else {
      super(message, arg);
    }
  }
}

export class SuccessAlert extends AlertData {
}

export class InfoAlert extends AlertData {
}

export interface State {
  locale: string;
  alerts: AlertData[];
  session: Session | null;
}

export function createState(): State {
  return {
    locale: navigator.language,
    alerts: [],
    session: null
  };
}
