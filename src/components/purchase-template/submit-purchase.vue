<template>
  <b-button variant="primary" :disabled="disabled" @click="$emit('submit')">{{ text }}</b-button>
</template>

<script lang="ts">
import { BButton } from 'bootstrap-vue';
import Vue from 'vue';

export default Vue.extend({
  components: { BButton },
  props: {
    currency: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    text: function (): string {
      const l = this.$store.state.locale;
      const f = new Intl.NumberFormat(l, { style: 'currency', currency: this.currency });

      return f.format(this.amount);
    }
  }
});
</script>
