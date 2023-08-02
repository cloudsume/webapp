import { inject, onBeforeMount } from 'vue';
import { Loading } from '@/state';

export function asyncInit(init: () => Promise<void>): void;
export function asyncInit<T>(init: (this: T) => Promise<void>, context: T): void;
export function asyncInit<T>(init: Function, context?: T): void {
  const loading = inject(Loading);

  if (!loading) {
    throw new Error('No loading state is provided.');
  }

  loading.value++; // set loading immediately to prevent flashing when the router is completed

  onBeforeMount(async function () {
    try {
      if (context !== undefined) {
        await init.call(context);
      } else {
        await init();
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading.value--;
    }
  });
}
