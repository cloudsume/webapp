import Vue from 'vue';

export interface PluginOptions {
  beforeFetch?: (this: Vue) => any;
  fetched?: (this: Vue) => any;
  createCompleted?: (this: Vue) => any;
}
