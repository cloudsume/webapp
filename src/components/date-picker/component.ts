import { BFormDatepicker } from 'bootstrap-vue';
import Vue from 'vue';
import { Module } from '@/config';
import { getDateTimeFormat } from '@/locales';

export default Vue.extend({
  components: { BFormDatepicker },
  inheritAttrs: false,
  computed: {
    locale(): string {
      return this.$store.state[Module.Settings].language;
    },
    format(): Intl.DateTimeFormatOptions {
      return getDateTimeFormat(this.locale, 'long');
    }
  }
});
