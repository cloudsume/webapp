<template>
  <b-card no-body>
    <!-- preview -->
    <div class="h-75" style="flex-basis: 0">
      <button v-if="clickablePreview" class="preview-button" :disabled="!ready" @click="$emit('preview')">
        <preview :url="preview" :alt="name" @ready="ready = true"></preview>
      </button>
      <template v-else>
        <preview :url="preview" :alt="name" @ready="ready = true"></preview>
      </template>
    </div>
    <!-- info -->
    <div class="flex-grow-1 h-25">
      <b-card-body class="h-100 d-flex flex-column">
        <slot name="title">
          <h5 class="card-title">{{ name }}</h5>
        </slot>
        <template-info :data="data" :show-resume-count="showResumeCount" :show-locale="showLocale"></template-info>
        <!-- action -->
        <slot></slot>
      </b-card-body>
    </div>
  </b-card>
</template>

<style lang="scss" scoped>
.preview-button {
  padding: 0;
  border: 0;
}
</style>

<script lang="ts">
import { BCard, BCardBody } from 'bootstrap-vue';
import Vue from 'vue';
import TemplateInfo from '@/components/template-info';
import { Template } from './models';
import Preview from './preview.vue';

export default Vue.extend({
  components: { BCard, BCardBody, Preview, TemplateInfo },
  props: {
    data: {
      type: Template,
      required: true
    },
    showResumeCount: Boolean,
    showLocale: Boolean,
    clickablePreview: Boolean
  },
  data: function () {
    return {
      ready: false
    };
  },
  computed: {
    preview: function (): string | null {
      return this.data.preview;
    },
    name: function (): string {
      return this.data.name;
    }
  }
});
</script>
