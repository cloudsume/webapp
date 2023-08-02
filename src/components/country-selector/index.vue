<template>
  <b-form-select :id="id" :state="state" :disabled="disabled" :options="items" :value="value" @change="$emit('input', $event)">
    <template #first>
      <b-form-select-option :value="''" disabled>{{ $t('select-country.label.placeholder') }}</b-form-select-option>
    </template>
  </b-form-select>
</template>

<script lang="ts">
import { BFormSelect, BFormSelectOption } from 'bootstrap-vue';
import Vue from 'vue';
import { getLanguageFamily } from '@/i18n';
import { Countries, CountryData } from '@/locales';

export default Vue.extend({
  components: { BFormSelect, BFormSelectOption },
  props: {
    id: String,
    value: String,
    state: {
      type: Boolean,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    filter: Function,
    resetInvalid: Boolean
  },
  computed: {
    countries: function (): Map<string, CountryData> {
      const result = new Map<string, CountryData>();

      for (const c of Countries) {
        if (this.filter && !this.filter(c.id)) {
          continue;
        }

        result.set(c.id, c);
      }

      return result;
    },
    items: function (): Item[] {
      const locale = this.$store.state.locale;
      const collator = new Intl.Collator(locale);
      const items = new Array<Item>();
      const lang = getLanguageFamily(locale);

      for (const c of this.countries.values()) {
        const name = c.name[lang];

        if (!name) {
          throw new Error(`No '${lang}' name for '${c.id}'.`);
        }

        items.push({ value: c.id, text: name });
      }

      return items.sort((a, b) => collator.compare(a.text, b.text));
    }
  },
  watch: {
    countries: {
      immediate: true,
      handler: function (v: Map<string, CountryData>) {
        if (this.resetInvalid && this.value && !v.has(this.value)) {
          this.$emit('input', '');
        }
      }
    }
  }
});

interface Item {
  value: string;
  text: string;
}
</script>
