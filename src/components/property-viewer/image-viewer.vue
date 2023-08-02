<template>
  <svg v-if="!local"
    xmlns="http://www.w3.org/2000/svg"
    class="img-thumbnail img-fluid w-100"
    style="text-anchor: middle"
    width="1"
    height="1">
    <rect width="100%" height="100%" fill="#6c757d"></rect>
    <text x="50%" y="50%" fill="#dee2e6" dy=".3em">{{ $t('property-viewer.label.loading-image') }}</text>
  </svg>
  <b-img v-else :src="local" fluid thumbnail></b-img>
</template>

<script lang="ts">
import { BImg } from 'bootstrap-vue';
import Vue from 'vue';
import { Source } from '@/store';

export default Vue.extend({
  components: { BImg },
  props: {
    url: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      local: ''
    };
  },
  mounted: async function () {
    let data;

    try {
      data = await this.$rest.downloadFile(this.url);
    } catch (e) {
      const error = e as Error;
      this.$error(Source.Server, () => this.$t('property-viewer.message.load-image-error', { url: this.url, error }), error);
      return;
    }

    this.local = URL.createObjectURL(data);
  },
  destroyed: function () {
    if (this.local) {
      URL.revokeObjectURL(this.local);
    }
  }
});
</script>
