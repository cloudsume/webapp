<template>
  <b-img :src="url" thumbnail fluid></b-img>
</template>

<script lang="ts">
import { BImg } from 'bootstrap-vue';
import Vue from 'vue';

export default Vue.extend({
  components: { BImg },
  props: {
    data: {
      type: Blob,
      required: true
    }
  },
  data: function () {
    return {
      url: ''
    };
  },
  watch: {
    'data': {
      immediate: true,
      handler: function (v: Blob) {
        if (this.url) {
          URL.revokeObjectURL(this.url);
        }

        this.url = URL.createObjectURL(v);
      }
    }
  },
  destroyed: function () {
    if (this.url) {
      URL.revokeObjectURL(this.url);
    }
  }
});
</script>
