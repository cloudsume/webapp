<template>
  <BOverlay :show="saving" spinner-variant="primary" rounded spinner-small>
    <BButton :disabled="props.disabled" :block="props.block" variant="primary" @click="emit('save')">
      {{ t('sample-data.label.save-all') }}
    </BButton>
  </BOverlay>
</template>

<script setup lang="ts">
import { BButton, BOverlay } from 'bootstrap-vue';
import { InjectionKey } from 'vue';
import { ContextKey } from '@/components/data-editor';
import { useTranslation } from '@/i18n';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';
import { Context } from './models';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  disabled: Boolean,
  block: Boolean
});

const emit = defineEmits<{
  (e: 'save'): void;
}>();

// component states
const context = inject(ContextKey as InjectionKey<Context>);

// computed
const saving = computed(function () {
  return context.saving;
});
</script>
