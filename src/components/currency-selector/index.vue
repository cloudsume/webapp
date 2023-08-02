<template>
  <div class="currency-container">
    <!-- select -->
    <select :value="value" :class="selectClass" @change="$emit('input', $event.target.value)">
      <option :value="''" disabled>{{ $t('currency-selector.label.placeholder') }}</option>
      <option v-for="c of available" :key="c" :value="c">{{ c }}</option>
    </select>
    <!-- flag -->
    <div class="d-flex align-items-center currency-flag">
      <flag-icon v-if="country" :country="country"></flag-icon>
      <span v-else class="flag-icon currency-icon"></span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/bootstrap';

.currency-container {
  height: 100%;
  position: relative;
}

.custom-select {
  position: absolute;
  left: 0;
  top: 0;
  padding-left: add($custom-select-padding-x, 21px);
}

.currency-flag {
  height: 100%;
  padding-left: $custom-select-padding-x;
  pointer-events: none;
}

.currency-icon {
  background-image: url(./coin.svg);
}
</style>

<script lang="ts">
import Vue from 'vue';
import FlagIcon from '@/components/flag-icon';
import { Available } from './data';

export default Vue.extend({
  components: { FlagIcon },
  props: {
    state: {
      type: Boolean,
      default: null
    },
    filter: Function,
    value: String
  },
  computed: {
    selectClass: function (): string {
      let c = 'custom-select';

      switch (this.state) {
        case true:
          c += ' is-valid';
          break;
        case false:
          c += ' is-invalid';
          break;
      }

      return c;
    },
    available: function (): string[] {
      return this.filter ? Available.filter(this.filter as any) : Available;
    },
    country: function (): string {
      if (!this.value) {
        return '';
      }

      const country = Countries[this.value];

      if (!country) {
        throw new Error(`Unknown currency ${this.value}.`);
      }

      return country;
    }
  }
});

const Countries: { [currency: string]: string } = {
  USD: 'us'
};
</script>
