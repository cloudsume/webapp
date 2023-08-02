<template>
  <stripe-element-payment
    :pk="key"
    :elements-options="options"
    :confirm-params="confirmParams"
    :locale="locale"
    class="mb-3"
    ref="stripe"
    @element-ready="ready"
    @error="error">
  </stripe-element-payment>
</template>

<script lang="ts">
import { StripeElementPayment } from '@vue-stripe/vue-stripe';
import Vue from 'vue';
import { getStripeKey } from '@/config';
import { StripePaymentInfo } from './models';

export default Vue.extend({
  components: { StripeElementPayment },
  props: {
    info: {
      type: StripePaymentInfo,
      required: true
    },
    returnUrl: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      submitError: null as ((reason: Error) => void) | null
    };
  },
  computed: {
    key: function (): string {
      return getStripeKey();
    },
    options: function (): object {
      return {
        clientSecret: this.info.clientSecret
      };
    },
    confirmParams: function (): object {
      return {
        return_url: this.returnUrl
      };
    },
    locale: function (): string {
      return this.$store.state.locale;
    }
  },
  methods: {
    ready: function (): void {
      this.$emit('ready');
      this.$emit('input', this.getResult);
    },
    error: function (e: Error): void {
      this.submitError?.call(undefined, e);
    },
    getResult: function (): Promise<void> {
      const r = new Promise<void>((resolve, reject) => this.submitError = reject);

      (this.$refs.stripe as any).submit();

      return r;
    }
  }
});
</script>
