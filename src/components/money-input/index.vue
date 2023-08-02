<template>
  <input type="text" :class="inputClass" :value="value.value" :placeholder="placeholder" :readonly="!currency" @input="notify">
</template>

<script lang="ts">
import Vue from 'vue';
import { InputResult } from '@/util/input-result';

export default Vue.extend({
  inheritAttrs: false,
  props: {
    state: {
      type: Boolean,
      default: null,
    },
    currency: String,
    placeholder: String,
    value: InputResult
  },
  computed: {
    inputClass: function (): string {
      let c = 'form-control';

      switch (this.state) {
        case true:
          c += ' is-valid';
          break;
        case false:
          c += ' is-invalid';
          break;
      }

      return c;
    }
  },
  methods: {
    notify: function (e: Event): void {
      const v = (e.target as HTMLInputElement).value;
      const r = this.validate(v);

      this.$emit('input', new InputResult(v, r));
    },
    validate: function (v: string): boolean {
      if (!v) {
        return false;
      }

      switch (this.currency) {
        case 'USD':
          return /^\d+(\.\d{2})?$/.test(v);
        default:
          return false;
      }
    }
  }
});
</script>
