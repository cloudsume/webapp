import Vue from 'vue';

/**
 * Retrieve data in the background and update result reactively.
 *
 * @param init Initial value for the data.
 * @param provider Function to provide the data. All dependencies must be gathered before first await.
 *
 * @returns The reactive object provides information about data retrieval.
 */
export function future<T>(init: T, provider: Provider<T>): FutureData<T> {
  const result = Vue.observable(new FutureData(init));

  retrieve(result, provider);

  return result;
}

export type Provider<T> = () => Promise<T>;

export class FutureData<T> {
  pending: boolean;
  value: T;

  constructor(init: T) {
    this.pending = true;
    this.value = init;
  }
}

async function retrieve<T>(result: FutureData<T>, provider: Provider<T>): Promise<void> {
  result.value = await provider();
  result.pending = false;
}
