import Vue from 'vue';

export type KeyProvider<Owner, Key> = (this: Owner) => Key;
export type KeyComparer<T> = (a: T, b: T) => boolean;
export type ValueProvider<Owner, Key, Value> = (this: Owner, key: Key) => Promise<Value>;

/**
 * Provides automatic fetching data on the remote when the specified key is changed or locale changed.
 */
export class RemoteData<Owner extends Vue, Key, Value> {
  key: Key | null;
  value: Value | null;
  hint: { key: Key, value: Value } | null;

  constructor(owner: Owner, provider: ValueProvider<Owner, Key, Value>);
  constructor(owner: Owner, provider: ValueProvider<Owner, Key, Value>, key: KeyProvider<Owner, Key> | Key, cmp?: KeyComparer<Key>);
  constructor(owner: Owner, provider: ValueProvider<Owner, Key, Value>, key?: KeyProvider<Owner, Key> | Key, cmp?: KeyComparer<Key>) {
    this.key = null;
    this.value = null;
    this.hint = null;
    this.owner = owner;
    this.provider = provider;
    this.pending = null;

    if (key) {
      this.watch(key, cmp);
    }
  }

  get busy(): boolean {
    return this.pending !== null;
  }

  watch(key: KeyProvider<Owner, Key> | Key, cmp?: KeyComparer<Key>): void {
    const keyChanged = (n: Key, o: Key | undefined) => {
      if (n === null || n === undefined) {
        this.cancel();
        this.update(null, null);
      } else if (o === null || o === undefined || !cmp || !cmp(n, o)) {
        this.cancel();

        if (this.hint && (n === this.hint.key || (cmp && cmp(n, this.hint.key)))) {
          this.update(n, this.hint.value);
          this.hint = null;
        } else {
          this.update(null, null);
          this.hint = null;
          this.fetch(n);
        }
      }
    };

    const localeChanged = () => {
      const k = this.cancel() ?? this.key;

      if (k !== null) {
        this.fetch(k);
      }
    };

    if (typeof key === 'function') {
      this.owner.$watch(key as any, keyChanged, { immediate: true });
    } else {
      keyChanged(key, undefined);
    }

    this.owner.$store.watch(s => s.locale, localeChanged);
  }

  private async fetch(key: Key): Promise<void> {
    // beware bug when refactoring if you don't fully understand what going on
    const p = this.pending = {
      result: this.provider.apply(this.owner, [key]),
      cancel: false,
      key
    };

    const r = await p.result;

    if (!p.cancel) {
      this.update(key, r);
      this.pending = null;
    }
  }

  private cancel(): Key | null {
    if (this.pending) {
      const k = this.pending.key;

      this.pending.cancel = true;
      this.pending = null;

      return k;
    } else {
      return null;
    }
  }

  private update(key: Key | null, value: Value | null): void {
    this.key = key;
    this.value = value;
  }

  private readonly owner: Owner;
  private readonly provider: ValueProvider<Owner, Key, Value>;
  private pending: PendingFetch<Key, Value> | null;
}

interface PendingFetch<Key, Value> {
  result: Promise<Value>;
  cancel: boolean;
  key: Key;
}
