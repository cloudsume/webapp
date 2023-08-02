import Vue from 'vue';
import { Context, ContextKey } from './models';

export interface Component extends Vue {
  context: Context;
}

export const Component = Vue.extend({
  inject: {
    context: ContextKey
  }
});
