<template>
  <b-alert :variant="variant" show dismissible fade @dismissed="$emit('dismissed', data.id)">
    {{ message }}
  </b-alert>
</template>

<script lang="ts">
import { BAlert } from 'bootstrap-vue';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { ErrorAlert, InfoAlert, SuccessAlert } from '@/store';

export default Vue.extend({
  components: { BAlert },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  computed: {
    variant: function (): string {
      if (this.data instanceof ErrorAlert) {
        return 'danger';
      } else if (this.data instanceof InfoAlert) {
        return 'info';
      } else if (this.data instanceof SuccessAlert) {
        return 'success';
      } else {
        throw new Error(`Unknow alert ${this.data}.`);
      }
    },
    message: function (): TranslateResult {
      const message = this.data.message;

      if (typeof message === 'string') {
        return this.$t(message, this.data.data);
      } else {
        return message();
      }
    }
  }
});
</script>
