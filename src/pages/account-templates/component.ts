import Vue from 'vue';
import { PageContext, PageContextKey } from './models';

export interface PageComponent extends Vue {
  context: PageContext;
}

export const PageComponent = Vue.extend({
  inject: {
    context: PageContextKey
  }
});
