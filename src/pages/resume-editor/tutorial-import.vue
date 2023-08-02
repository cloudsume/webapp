<template>
  <div>
    <!-- text -->
    <p>{{ t('resume-editor.message.tutorial-import-description') }}</p>
    <!-- picture -->
    <div class="d-flex justify-content-center">
      <img src="./tutorial-import.png" class="description-img">
    </div>
  </div>
</template>

<style scoped lang="scss">
.description-img {
  width: 379px;
  max-width: 100%;
}
</style>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ResultFactory } from '@/components/wizard-modal';
import { useTranslation } from '@/i18n';

const { t } = useTranslation();

// props & emit
const emit = defineEmits<{
  (e: 'ready'): void;
  (e: 'update', v: ResultFactory): void;
}>();

// lifecycle hooks
onMounted(function () {
  emit('ready');
  emit('update', () => {});
});
</script>
