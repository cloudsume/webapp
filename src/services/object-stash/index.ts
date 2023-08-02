export function createKey<T>(desc?: string | number): ObjectKey<T> {
  return Symbol(desc);
}

export class ObjectStash {
  constructor() {
    this.items = new Map();
  }

  get<T>(key: ObjectKey<T>): T | undefined;
  get<T>(key: ObjectKey<T>, factory: () => T): T;
  get<T>(key: ObjectKey<T>, factory?: () => T): T | undefined {
    let value = this.items.get(key) as T | undefined;

    if (value === undefined && factory) {
      this.items.set(key, value = factory());
    }

    return value;
  }

  set<T>(key: ObjectKey<T>, value: T) {
    this.items.set(key, value);
  }

  private readonly items: Map<ObjectKey<unknown>, unknown>;
}

export interface ObjectKey<T> extends Symbol {
}
