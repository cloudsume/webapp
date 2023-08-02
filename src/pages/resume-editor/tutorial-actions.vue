<template>
  <div>
    <!-- text -->
    <p>{{ t('resume-editor.message.tutorial-actions-description') }}</p>
    <p>{{ t('resume-editor.message.tutorial-change-template-note') }}</p>
    <!-- picture -->
    <picture>
      <source srcset="./tutorial-actions-desktop.png" :media="lgMedia"/>
      <source srcset="./tutorial-actions-tablet.png" :media="mdMedia"/>
      <img src="./tutorial-actions-mobile.png" style="max-width: 100%">
    </picture>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { GridBreakpoints } from '@/config';
import { useTranslation } from '@/i18n';
import { ResultFactory } from '@/components/wizard-modal';
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
