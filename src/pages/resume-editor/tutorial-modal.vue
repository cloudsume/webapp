<template>
  <WizardModal
    :title="t('resume-editor.label.tutorial-title')"
    start="actions"
    :navigator="navigator"
    :completor="() => true"
    hide-cancel
    @hidden="emit('hidden')">
    <!-- resume actions -->
    <template #page(actions)="{ ready, update }">
      <TutorialActions @ready="ready" @update="update"></TutorialActions>
    </template>
    <!-- import data -->
    <template #page(import)="{ ready, update }">
      <TutorialImport @ready="ready" @update="update"></TutorialImport>
    </template>
    <!-- global data -->
    <template #page(global)="{ ready, update }">
      <TutorialGlobal @ready="ready" @update="update"></TutorialGlobal>
    </template>
    <!-- close -->
    <template #complete(close)="{ disabled, proceed }">
      <BButton variant="primary" :disabled="disabled" @click="proceed">
        {{ t('resume-editor.label.tutorial-close') }}
      </BButton>
    </template>
  </WizardModal>
</template>

<script setup lang="ts">
import { BButton } from 'bootstrap-vue';
import WizardModal, { Navigation } from '@/components/wizard-modal';
import { useTranslation } from '@/i18n';
import TutorialActions from './tutorial-actions.vue';
import TutorialGlobal from './tutorial-global.vue';
import TutorialImport from './tutorial-import.vue';

const { t } = useTranslation();

// props & emit
const emit = defineEmits<{
  (e: 'hidden'): void;
}>();

// functions
const navigator = function (current: string, result: unknown): Navigation | null {
  switch (current) {
    case 'actions':
      return new Navigation('import', null);
    case 'import':
      return new Navigation('global', null, 'close');
    default:
      throw new Error(`Unknown page ${current}.`);
  }
};
</script>
