import Vue from 'vue';
import { ContextKey } from '@/components/data-editor';
import { Context } from './models';

export interface PageComponent extends Vue {
  context: Context;
}

export const PageComponent = Vue.extend({
  inject: { context: ContextKey as symbol }
});
