import { inject as real, InjectionKey } from 'vue';

/**
 * A wrapper of Vue's inject to throw an error if the specified key does not exists.
 */
export function inject<T>(key: InjectionKey<T>): T {
  const v = real(key);

  if (!v) {
    throw new Error(`No value is provided for ${key}.`);
  }

  return v;
}
