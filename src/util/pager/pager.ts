export type Loader<T> = (skip: T | undefined, count: number) => Promise<Array<T>>;

export function blankCursor<T>(): Cursor<T> {
  return { items: [], start: 0 };
}

export interface Cursor<T> {
  items: Array<T>;
  start: number;
}

export class Pager<T> {
  /**
   * Initializes a new pager with size per page and the function to fetch more entries.
   *
   * @param size A number of entries per page.
   * @param loader A function to fetch more entries.
   */
  constructor(size: number, loader: Loader<T>);
  constructor(size: number, items: T[]);
  constructor(size: number, a: any) {
    this.size = size;

    if (typeof a === 'function') {
      this.loader = a;
      this.items = [];
    } else {
      this.items = a;
    }
  }

  async next(current?: Cursor<T>): Promise<Cursor<T>> {
    // calculate next window
    const start = current ? current.start + current.items.length : 0;
    const end = start + this.size;

    // fetch more items if the cached is not enough
    if (end > this.items.length && this.loader) {
      const last = (this.items.length === 0) ? undefined : this.items[this.items.length - 1];
      const items = await this.loader(last, end - this.items.length);
      this.items.push(...items);
    }

    // create window
    return {
      items: start >= this.items.length ? [] : this.items.slice(start, Math.min(end, this.items.length)),
      start: Math.min(start, this.items.length)
    };
  }

  previous(current: Cursor<T>): Cursor<T> {
    const start = Math.max(0, current.start - this.size);
    const end = Math.min(this.items.length, start + this.size);

    return { items: this.items.slice(start, end), start };
  }

  remove(current: Cursor<T>, start: number) {
    current.items.splice(start, 1);
    this.items.splice(current.start + start, 1);
  }

  private size: number;
  private loader?: Loader<T>;
  private items: Array<T>;
}
