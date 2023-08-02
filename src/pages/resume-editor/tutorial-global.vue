<template>
  <div>
    <!-- text -->
    <p>{{ t('resume-editor.message.tutorial-global-description') }}</p>
    <!-- picture -->
    <div class="d-flex justify-content-center">
      <picture>
        <source srcset="./tutorial-global-desktop.png" :media="lgMedia"/>
        <source srcset="./tutorial-global-tablet.png" :media="mdMedia"/>
        <img src="./tutorial-global-mobile.png" class="description-img">
      </picture>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '~@/styles/bootstrap';

.description-img {
  max-width: 100%;
}

@include media-breakpoint-up(lg) {
  .description-img {
    width: 317.5px;
  }
}
</style>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ResultFactory } from '@/components/wizard-modal';
import { GridBreakpoints } from '@/config';
import { useTranslation } from '@/i18n';
import { computed } from '@/util/computed';

const { t } = useTranslation();

// props & emit
const emit = defineEmits<{
  (e: 'ready'): void;
  (e: 'update', v: ResultFactory): void;
}>();

// computed
const lgMedia = computed(function () {
  return `(min-width: ${GridBreakpoints.lg})`;
});

const mdMedia = computed(function () {
  return `(min-width: ${GridBreakpoints.md})`;
});

// lifecycle hooks
onMounted(function () {
  emit('ready');
  emit('update', () => {});
});
</script>
