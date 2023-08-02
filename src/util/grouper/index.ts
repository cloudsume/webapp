export function group<T, K>(items: Iterable<T>, key: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();

  for (const i of items) {
    const k = key(i);
    let g = groups.get(k);

    if (g === undefined) {
      groups.set(k, g = []);
    }

    g.push(i);
  }

  return groups;
}
