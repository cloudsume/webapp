import { DataProperty, PropertyFlags } from '@/clients/resume-data';
import { Uuid } from '@/util/uuid';

export type ValueMode = 'disabled' | 'base' | 'local';

export function toNonNull<T>(v: T | null): T {
  if (v === null) {
    throw new Error('No value has been specified.');
  }

  return v;
}

export function toString(v: Uuid | null): string {
  if (v === null) {
    throw new Error('No value has been specified.');
  }

  return v.toString();
}

export function trim(v: string): string {
  return v.trim();
}

export class FieldValue<T> {
  mode: ValueMode | undefined;
  value: T | undefined;
  error: boolean;

  constructor() {
    this.mode = undefined;
    this.value = undefined;
    this.error = false;
  }

  get changed(): boolean {
    return this.mode !== undefined || this.value !== undefined;
  }

  get handlers(): object {
    return {
      change: (m: ValueMode | undefined) => this.mode = m,
      input: (v: T | undefined) => this.value = v,
      valid: () => this.error = false,
      invalid: () => this.error = true
    };
  }

  toDto(src: DataProperty<T> | null | undefined): DataProperty<T>;
  toDto<V>(src: DataProperty<V> | null | undefined, converter?: (local: T) => V): DataProperty<V>;
  toDto(src: DataProperty<unknown> | null | undefined, converter?: (local: T) => unknown): DataProperty<unknown> {
    let f: PropertyFlags;
    let v: unknown;

    if (this.mode !== undefined) {
      // mode is different from the remote
      switch (this.mode) {
        case 'disabled':
          f = PropertyFlags.Disabled;
          v = null;
          break;
        case 'base':
          f = PropertyFlags.None;
          v = null;
          break;
        case 'local':
          f = PropertyFlags.None;

          if (this.value !== undefined) {
            v = converter ? converter(this.value) : this.value;
          } else if (!src) {
            // this should never happen
            throw new Error("Value does not different from the remote but we don't have the remote?");
          } else {
            v = src.value;
          }
          break;
        default:
          throw new Error(`Unknow mode ${this.mode}.`);
      }
    } else if (!src) {
      // this should never happen
      throw new Error("Mode does not different from the remote but we don't have the remote?");
    } else {
      // mode not changed
      f = src.flags;

      if (f & PropertyFlags.Disabled || src.value === null) {
        v = null;
      } else if (this.value !== undefined) {
        v = converter ? converter(this.value) : this.value;
      } else {
        v = src.value;
      }
    }

    return new DataProperty(f, v);
  }
}
