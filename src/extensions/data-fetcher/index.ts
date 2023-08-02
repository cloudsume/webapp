import Vue from 'vue';
import { PluginOptions } from './options';

export { PluginOptions };

export default {
  install
}

function install(v: typeof Vue, options?: PluginOptions) {
  const mixin = v.extend({
    beforeCreate: function () {
      if (this.$options.fetch) {
        const instance = this;
        const fetch = this.$options.fetch.bind(instance);

        this.$refetch = async function () {
          options?.beforeFetch?.call(instance);

          try {
            await fetch();
          } finally {
            options?.fetched?.call(instance);
          }
        }
      }
    },
    beforeMount: async function () {
      if (this.$refetch) {
        try {
          await this.$refetch();
        } finally {
          options?.createCompleted?.call(this);
        }
      }
    }
  });

  v.mixin(mixin);
}
