<template>
  <b-dropdown :text="display" :disabled="index === null" variant="primary" split dropup right @click="$emit('confirm')">
    <b-dropdown-item-button v-for="(p, i) of available" :key="p.currency" :active="i === index" @click="selected = i">
      {{ p.text }}
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script lang="ts">
import { BDropdown, BDropdownItemButton } from 'bootstrap-vue';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { TemplateRegistration } from '@/clients/template-registration';
import { getLanguageRegion, getPreferredCurrency } from '@/i18n';

export default Vue.extend({
  components: { BDropdown, BDropdownItemButton },
  props: {
    registration: TemplateRegistration
  },
  data: function () {
    return {
      selected: null as number | null
    };
  },
  computed: {
    available: function (): Price[] {
      const prices = new Array<Price>();

      if (!this.registration) {
        return prices;
      }

      const locale = this.$store.state.locale;

      for (const [c, p] of [...this.registration.prices].sort((a, b) => a[0].localeCompare(b[0], 'en'))) {
        const f = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: c
        });

        prices.push({ currency: c, value: p, text: f.format(p) });
      }

      return prices;
    },
    display: function (): TranslateResult {
      if (this.index !== null) {
        return this.available[this.index].text;
      } else {
        return this.$t('purchase-template.label.select-price');
      }
    },
    index: function (): number | null {
      return this.selected ?? this.preferred;
    },
    preferred: function (): number | null {
      if (!this.available.length) {
        return null;
      }

      const country = getLanguageRegion(this.$store.state.locale);
      const preferred = getPreferredCurrency(country);
      const index = this.available.findIndex(p => p.currency === preferred);

      return index === -1 ? null : index;
    }
  },
  watch: {
    'registration': function () {
      this.selected = null;
    },
    'index': {
      immediate: true,
      handler: function (v: number | null) {
        this.$emit('input', v === null ? null : this.getResult);
      }
    }
  },
  methods: {
    getResult: function (): string {
      if (this.index === null) {
        throw new Error('No price selected.');
      }

      return this.available[this.index].currency;
    }
  }
});

interface Price {
  currency: string;
  value: number;
  text: string;
}
</script>
