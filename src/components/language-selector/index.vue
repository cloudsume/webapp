<template>
  <b-form-select :id="id" :state="state" :options="items" :value="value" @change="$emit('input', $event)">
    <template #first>
      <b-form-select-option value="" disabled>{{ $t('account-templates.label.new-registration-culture-ph') }}</b-form-select-option>
    </template>
  </b-form-select>
</template>

<script lang="ts">
import { parse } from 'bcp-47';
import { BFormSelect, BFormSelectOption } from 'bootstrap-vue';
import Vue from 'vue';
import { getLanguageName, Languages } from '@/i18n';

export default Vue.extend({
  components: { BFormSelect, BFormSelectOption },
  props: {
    id: String,
    state: Boolean,
    value: String,
    filter: Function,
    resetInvalid: Boolean,
  },
  computed: {
    available: function (): Set<string> {
      const result = new Set<string>();

      for (const { tag } of Languages) {
        const { region } = parse(tag);

        if (region || (this.filter && !this.filter(tag))) {
          continue;
        }

        result.add(tag);
      }

      return result;
    },
    items: function (): Item[] {
      const locale = this.$store.state.locale;
      const result = new Array<Item>();

      for (const tag of this.available) {
        result.push({ text: getLanguageName(tag, locale), value: tag });
      }

      return result.sort((a, b) => a.text.localeCompare(b.text, locale));
    }
  },
  watch: {
    available: {
      immediate: true,
      handler: function (v: Set<string>) {
        if (this.resetInvalid && this.value && !v.has(this.value)) {
          this.$emit('input', '');
        }
      }
    }
  }
});

interface Item {
  text: string;
  value: string;
}
</script>
