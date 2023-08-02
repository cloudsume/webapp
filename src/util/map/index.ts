/**
 * Like Map.get() but throw instead of returning an undefined when the key does not exists.
 */
export function getMapValue<K, V>(m: Map<K, V>, k: K): V {
  const v = m.get(k);

  if (v === undefined) {
    throw new Error(`Key '${k}' does not exists.`);
  }

  return v;
}
