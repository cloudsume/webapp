import type { Item } from './models';

export function* enumerateItems(items: Item[]) {
  let prev, index = 0;

  for (let i = 0; i < items.length; prev = items[i].type, i++) {
    const { type, data } = items[i];

    // get index within the group
    if (type !== prev) {
      index = 0;
    } else {
      index++;
    }

    // skip any placeholders
    if (!data) {
      continue;
    }

    yield { type, index, data };
  }
}
