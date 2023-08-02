export function bind<O, A extends any[], R>(obj: O, fn: (this: O, ...args: A) => R): (...args: A) => R {
  return fn.bind(obj);
}
