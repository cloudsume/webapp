<template>
  <div class="markdown-viewer" v-html="html"></div>
</template>

<style lang="scss" scoped>
.markdown-viewer:deep(> :last-child) {
  margin-bottom: 0;
}
</style>

<script lang="ts">
import { sanitize } from 'dompurify';
import { marked } from 'marked';
import Vue from 'vue';

export default Vue.extend({
  props: {
    id: {
      type: String,
      required: true
    },
    data: {
      type: String,
      required: true
    }
  },
  computed: {
    html: function (): string {
      const html = marked.parse(this.data, {
        headerPrefix: this.id + '-',
        silent: true
      });

      return sanitize(html);
    }
  }
});
</script>
