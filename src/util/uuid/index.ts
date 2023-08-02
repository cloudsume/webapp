import { parse, stringify, v4 } from 'uuid';

export class Uuid {
  constructor();
  constructor(v: string);
  constructor(v: Uint8Array);
  constructor(v: ArrayBuffer);
  constructor(v?: any) {
    if (typeof v === 'string') {
      this.data = parse(v) as Uint8Array;
    } else if (v instanceof Uint8Array) {
      if (v.length !== 16) {
        throw new TypeError('Invalid UUID');
      }
      this.data = v;
    } else if (v instanceof ArrayBuffer) {
      if (v.byteLength !== 16) {
        throw new TypeError('Invalid UUID');
      }
      this.data = new Uint8Array(v);
    } else {
      this.data = v4(undefined, new Uint8Array(16));
    }
  }

  isNil(): boolean {
    return this.equals(NilUUID);
  }

  equals(other: Uuid): boolean {
    for (let i = 0; i < 16; i++) {
      if (other.data[i] !== this.data[i]) {
        return false;
      }
    }
    return true;
  }

  compare(other: Uuid): number {
    for (let i = 0; i < 16; i++) {
      const r = this.data[i] - other.data[i];

      if (r !== 0) {
        return r;
      }
    }

    return 0;
  }

  toString(): string {
    return stringify(this.data);
  }

  private readonly data: Uint8Array;
}

export const NilUUID = new Uuid('00000000-0000-0000-0000-000000000000');
