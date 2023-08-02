import { computed as backend, ComputedGetter, ComputedRef, DebuggerOptions } from 'vue';

export function computed<T>(getter: ComputedGetter<T>, options?: DebuggerOptions): ComputedRef<T>;
export function computed<C, T>(context: C, getter: BoundedGetter<C, T>, options?: DebuggerOptions): ComputedRef<T>;
export function computed<C, T>(arg1: ComputedGetter<T> | C, arg2?: DebuggerOptions | BoundedGetter<C, T>, arg3?: DebuggerOptions): ComputedRef<T> {
  if (typeof arg2 === 'function') {
    return backend(arg2.bind(arg1 as C), arg3);
  } else {
    return backend(arg1 as ComputedGetter<T>, arg2);
  }
}

export type BoundedGetter<C, T> = (this: C, ...args: any[]) => T;
