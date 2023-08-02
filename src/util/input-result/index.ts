export class InputResult<T> {
  value: T;
  valid: boolean;

  constructor(value: T, valid: boolean) {
    this.value = value;
    this.valid = valid;
  }
}
