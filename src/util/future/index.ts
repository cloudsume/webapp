import { shallowRef, ShallowRef, watchEffect } from 'vue';

export function future<T>(provider: () => Promise<T>): ShallowRef<T | Error | undefined> {
  const future: ShallowRef<T | Error | undefined> = shallowRef(undefined);
  const pendings = new Array<Promise<T>>();
  const completed = (promise: Promise<T>, result: T | Error) => {
    // check if the current promise already discarded
    const i = pendings.indexOf(promise);

    if (i === -1) {
      return;
    }

    // discard current promise all previouses
    pendings.splice(0, i + 1);

    // update the value if current promise is the latest one
    if (!pendings.length) {
      future.value = result;
    }
  };

  watchEffect(function () {
    // set to pending
    if (!pendings.length) {
      future.value = undefined;
    }

    // execute provider
    let promise: Promise<T>;

    try {
      promise = provider();
    } catch (e) {
      promise = Promise.reject(e);
    }

    pendings.push(promise);

    // wait for completion
    promise.then(v => completed(promise, v), e => completed(promise, e));
  });

  return future;
}
