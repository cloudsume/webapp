<template>
  <div class="d-flex">
    <!-- country -->
    <b-form-select :options="countries" :value="country" :disabled="disabled" :state="countryState" :id="countryId" class="mr-1" @change="setCountry">
      <template #first>
        <b-form-select-option :value="''">{{ $t('division-selector.label.country') }}</b-form-select-option>
      </template>
    </b-form-select>
    <!-- division -->
    <b-form-select :options="divisions" :value="division" :disabled="disabled" :state="state" @change="setDivision">
      <template #first>
        <b-form-select-option :value="''">{{ $t('division-selector.label.division') }}</b-form-select-option>
      </template>
    </b-form-select>
  </div>
</template>

<script lang="ts">
import { BFormSelect, BFormSelectOption } from 'bootstrap-vue';
import Vue from 'vue';
import { getCountryCode, getLanguageFamily, getSubdivisions } from '@/i18n';
import { Countries } from '@/locales';

export default Vue.extend({
  components: { BFormSelect, BFormSelectOption },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    countryId: String,
    disabled: Boolean,
    state: {
      type: Boolean,
      default: null
    },
    value: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      country: '',
      division: ''
    };
  },
  computed: {
    countries: function (): Item[] {
      const locale = this.$store.state.locale;
      const lang = getLanguageFamily(locale);
      const items = new Array<Item>();

      for (const c of Countries) {
        items.push({ text: c.name[lang], value: c.id });
      }

      return items.sort((a, b) => a.text.localeCompare(b.text, locale));
    },
    divisions: function (): Item[] {
      if (this.country) {
        const locale = this.$store.state.locale;
        const lang = getLanguageFamily(locale);
        const items = new Array<Item>();

        for (const d of getSubdivisions(this.country)) {
          items.push({ text: d.name[lang], value: d.id });
        }

        return items.sort((a, b) => a.text.localeCompare(b.text, locale));
      } else {
        return [];
      }
    },
    countryState: function (): boolean | null {
      if (this.state === null || this.state) {
        return this.state;
      } else if (this.country) {
        return null;
      } else {
        return false;
      }
    }
  },
  methods: {
    setCountry: function (v: string): void {
      this.country = v;
      this.setDivision('');
    },
    setDivision: function (v: string): void {
      this.division = v;
      this.$emit('input', v);
    }
  },
  watch: {
    'value': {
      immediate: true,
      handler: function (n: string) {
        // do not update local data if this changes is triggered by us
        if (n !== this.division) {
          this.country = n ? getCountryCode(n) : '';
          this.division = n;
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
