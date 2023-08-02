export const ContextKey = Symbol();

export type CompleteBrowsing = (result: unknown) => void;

export class Context {
  value: unknown;
  state: boolean | null;
  disabled: boolean;
  busy: boolean;

  constructor() {
    this.value = null;
    this.state = null;
    this.disabled = false;
    this.busy = false;
  }
}
