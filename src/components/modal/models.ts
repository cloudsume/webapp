import { TranslateResult } from 'vue-i18n';

export type Ok = (result?: unknown) => void;
export type Proceed = (result?: unknown) => void;
export type ToggleBusy = (busy: boolean) => void;

export class ModalContext {
  readonly title?: TranslateResult | (() => TranslateResult);

  constructor(title?: TranslateResult | (() => TranslateResult)) {
    this.title = title;
  }
}
