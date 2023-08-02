import { BvModalEvent } from 'bootstrap-vue';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import Modal from '@/components/modal';

export default Vue.extend({
  components: { Modal },
  inheritAttrs: false,
  model: {
    event: 'change'
  },
  props: {
    title: {
      type: String,
      required: true
    },
    variant: {
      type: String
    },
    message: {
      type: [String, Object]
    },
    value: {
    }
  },
  data: function () {
    return {
      busy: false
    };
  },
  methods: {
    getMessage(value: any): TranslateResult | undefined {
      const t = this.message;

      if (t === undefined) {
        return undefined;
      } else if (typeof t === 'string') {
        return this.$t(t);
      } else {
        const { key, values } = t;
        return this.$t(key, typeof values === 'function' ? values(value) : values);
      }
    },
    confirm(e: BvModalEvent): void {
      e.preventDefault();

      this.busy = true;
      this.$emit('confirm', this.complete, this.value);
    },
    complete(result?: any): void {
      this.busy = false;

      if (result !== undefined) {
        this.$emit('change', undefined);
        this.$emit('input', result);
      }
    },
    hiding(e: BvModalEvent): void {
      if (this.busy) {
        e.preventDefault();
      }
    }
  }
});
