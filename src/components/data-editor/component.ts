import Vue from 'vue';
import { ContextKey, EditingContext } from './context';

export interface EditorComponent extends Vue {
  context: EditingContext<unknown>;
}

export const EditorComponent = Vue.extend({
  inject: { context: ContextKey as symbol }
});
