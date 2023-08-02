<template>
  <div>
    <!-- input -->
    <slot name="input" :context="context" :browse="browse">
      <browse-input :button-id="buttonId" :icon="icon" @browse="browse"></browse-input>
    </slot>
    <!-- modal -->
    <modal
      :title="title"
      :context="browsing"
      :body-class="bodyClass"
      :footer-class="footerClass"
      :hide-footer="hideFooter"
      :size="modalSize"
      v2
      @show="$emit('show', $event)"
      @hide="$emit('hide', $event)"
      @hidden="$emit('hidden', $event)"
      @change="browsing = $event">
      <template v-for="(s, n) of $scopedSlots" v-slot:[n]="p">
        <slot :name="n" v-bind="{ ...p, complete: completeBrowsing }"></slot>
      </template>
    </modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Modal, { ModalContext } from '@/components/modal';
import BrowseInput from './browse-input.vue';
import { Context, ContextKey } from './models';

export default Vue.extend({
  components: { BrowseInput, Modal },
  props: {
    title: {
      type: String,
      required: true
    },
    buttonId: {
      type: String,
      default: null
    },
    value: {
      required: true
    },
    state: {
      type: Boolean,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    busy: {
      type: Boolean,
      default: false
    },
    bodyClass: {
      type: String,
      default: null
    },
    footerClass: {
      type: String,
      default: null
    },
    hideFooter: {
      type: Boolean,
      default: false
    },
    modalSize: {
      type: String,
      default: 'md'
    },
    icon: {
      type: String
    }
  },
  data: function () {
    const c = new Context();

    this.$watch(() => this.value, v => c.value = v, { immediate: true });
    this.$watch(() => this.state, v => c.state = v, { immediate: true });
    this.$watch(() => this.disabled, v => c.disabled = v, { immediate: true });
    this.$watch(() => this.busy, v => c.busy = v, { immediate: true });

    return {
      context: c,
      browsing: null as BrowsingContext | null
    };
  },
  provide: function (): object {
    return {
      [ContextKey]: this.context
    };
  },
  methods: {
    browse: function (): void {
      this.browsing = new BrowsingContext();
    },
    completeBrowsing: function (r: unknown): void {
      this.browsing = null;
      this.$emit('input', r);
    }
  }
});

class BrowsingContext extends ModalContext {
}
</script>
