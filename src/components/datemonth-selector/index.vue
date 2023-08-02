<template>
  <div class="d-flex">
    <!-- month -->
    <b-form-select :options="months" :value="currentMonth" :disabled="disabled" :state="monthState" :id="monthId" class="mr-1" @change="setMonth">
      <template #first>
        <b-form-select-option :value="null" disabled>{{ $t('datemonth-selector.label.month') }}</b-form-select-option>
      </template>
    </b-form-select>
    <!-- year -->
    <b-form-select :options="years" :value="currentYear" :disabled="disabled" :state="yearState" @change="setYear">
      <template #first>
        <b-form-select-option :value="null" disabled>{{ $t('datemonth-selector.label.year') }}</b-form-select-option>
      </template>
    </b-form-select>
  </div>
</template>

<script lang="ts">
import { BFormSelect, BFormSelectOption } from 'bootstrap-vue';
import Vue from 'vue';
import { DateMonth } from '@/clients/rest';

export default Vue.extend({
  components: { BFormSelect, BFormSelectOption },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    monthId: String,
    disabled: Boolean,
    state: Boolean,
    value: DateMonth
  },
  data: function () {
    return {
      currentMonth: null as number | null,
      currentYear: null as number | null
    };
  },
  computed: {
    months: function (): Item[] {
      const locale = this.$store.state.locale;
      const items = new Array<Item>();

      for (let m = 0; m < 12; m++) {
        const d = new Date();
        d.setMonth(m, 1);
        items.push({ text: d.toLocaleString(locale, { month: 'long' }), value: m });
      }

      return items;
    },
    years: function (): Item[] {
      const now = new Date();
      const items = new Array<Item>();

      for (let y = now.getFullYear(); y >= 1950; y--) {
        // bootstrap-vue don't support other calendar yet so we don't need to bother here
        items.push({ text: y.toString(), value: y });
      }

      return items;
    },
    monthState: function (): boolean | null {
      if (this.currentMonth !== null && this.currentYear !== null) {
        // value is not null that mean state will take all responsibility
        return this.state;
      } else if (this.state === null || this.state) {
        // value is null but state is not error
        return this.state;
      } else if (this.currentMonth === null) {
        // value is null and state is error and no month is selected
        return false;
      } else {
        // value is null and state is error and month have value
        return null;
      }
    },
    yearState: function (): boolean | null {
      if (this.currentMonth !== null && this.currentYear !== null) {
        // value is not null that mean state will take all responsibility
        return this.state;
      } else if (this.state === null || this.state) {
        // value is null but state is not error
        return this.state;
      } else if (this.currentYear === null) {
        // value is null and state is error and no year is selected
        return false;
      } else {
        // value is null and state is error and year have value
        return null;
      }
    }
  },
  methods: {
    setMonth: function (v: number | null): void {
      this.currentMonth = v;
      this.notifyValue();
    },
    setYear: function (v: number | null): void {
      this.currentYear = v;
      this.notifyValue();
    },
    notifyValue: function (): void {
      let v;

      if (this.currentMonth !== null && this.currentYear !== null) {
        v = new DateMonth(this.currentMonth, this.currentYear);
      } else {
        v = null;
      }

      this.$emit('input', v);
    }
  },
  watch: {
    'value': {
      immediate: true,
      handler: function (n: DateMonth | null) {
        if (n) {
          this.currentMonth = n.month;
          this.currentYear = n.year;
        } else {
          this.currentMonth = null;
          this.currentYear = null;
        }
      }
    }
  }
});

interface Item {
  text: string;
  value: number;
}
</script>
