<template>
  <div class="position-relative">
    <!-- country -->
    <div class="country">
      <div class="country-container">
        <div class="country-label d-flex align-items-center">
          <flag-icon :country="country"></flag-icon>
        </div>
        <select :value="country" :disabled="disabled" class="country-selector" @change="countryChanged">
          <option v-for="c of countries" :key="c.value" :value="c.value">{{ c.text }}</option>
        </select>
      </div>
    </div>
    <!-- number -->
    <input :id="numberId" :disabled="disabled" :class="inputClasses" :value="number" type="tel" ref="number" @input="numberChanged">
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/bootstrap';

.country {
  position: absolute;
  left: 0;
  top: 0;
  height: $input-height;
}

.country-container {
  position: relative;
  display: inline-block;
  height: 100%;
}

.country-label {
  height: 100%;
  padding-left: $input-padding-x;
  padding-right: $custom-select-padding-x + $custom-select-indicator-padding;
  background: $custom-select-background;
}

.country-selector {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.number {
  padding-left: add(add($input-padding-x, ((4 / 3) * 1em)), add($custom-select-padding-x, $custom-select-indicator-padding));
}
</style>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { TelephoneNumber } from '@/clients/rest';
import FlagIcon from '@/components/flag-icon';
import { getLanguageFamily, getLanguageRegion } from '@/i18n';
import { Countries } from '@/locales';

export default Vue.extend({
  components: { FlagIcon },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    numberId: String,
    disabled: Boolean,
    state: Boolean,
    value: TelephoneNumber
  },
  data: function () {
    const locale = this.$store.state.locale;

    return {
      country: getLanguageRegion(locale),
      number: ''
    };
  },
  computed: {
    inputClasses: function (): string[] {
      const classes = ['number', 'form-control'];

      if (this.state === true) {
        classes.push('is-valid');
      } else if (this.state === false) {
        classes.push('is-invalid');
      }

      return classes;
    },
    countries: function (): Item[] {
      const locale = this.$store.state.locale;
      const language = getLanguageFamily(locale);
      const result = new Array<Item>();

      for (const c of Countries) {
        result.push({ text: c.name[language], value: c.id })
      }

      return result.sort((a, b) => a.text.localeCompare(b.text, locale));
    }
  },
  methods: {
    getInvalidNumberError: function (): TranslateResult {
      return this.$t('telephone-input.message.invalid-number');
    },
    countryChanged: function (e: Event): void {
      this.country = (e.target as HTMLSelectElement).value;
      this.notifyInput();
      (this.$refs.number as HTMLElement).focus();
    },
    numberChanged: function (e: Event): void {
      this.number = (e.target as HTMLInputElement).value.trim();
      this.notifyInput();
    },
    notifyInput: function (): void {
      this.$emit('input', this.number ? new TelephoneNumber(this.country, this.number) : null);
    }
  },
  watch: {
    'value': {
      immediate: true,
      handler: function (n: TelephoneNumber | null) {
        if (n) {
          this.country = n.country;
          this.number = n.number.trim();
        } else {
          // TODO: reset country to default value if this changes does not triggered by our notifyInput
          this.number = '';
        }
      }
    },
    'number': {
      immediate: true,
      handler: function (n: string) {
        if (isValidNumber(n)) {
          this.$emit('valid');
        } else {
          this.$emit('invalid', this.getInvalidNumberError);
        }
      }
    }
  }
});

function isValidNumber(v: string): boolean {
  if (v.length > 30) {
    return false;
  }

  for (const c of v) {
    const n = c.codePointAt(0)!;

    if (n < 0x30 || n > 0x39) {
      return false;
    }
  }

  return true;
}

interface Item {
  text: string;
  value: string;
}
</script>
