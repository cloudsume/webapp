<template>
  <Modal body-class="pb-0" footer-class="justify-content-between flex-nowrap" size="xl" v3 @hidden="emit('hidden')">
    <!-- header -->
    <template #modal-header="{ close }">
      <h5 class="modal-title text-truncate">{{ name }}</h5>
      <button class="close" type="button" @click="close">×</button>
    </template>
    <!-- body -->
    <template #default="{}">
      <TemplateDetails :data="template" show-resume-count show-locale></TemplateDetails>
    </template>
    <!-- footer -->
    <template #modal-footer="{ cancel }">
      <!-- locale -->
      <div class="text-truncate">{{ locale }}</div>
      <!-- actions -->
      <TemplateActions
        :template="template"
        :resume-count="resumeCount"
        :cancel-action="primaryAction"
        :cancel-action-variant="primaryActionVariant"
        @cancel="cancel()">
      </TemplateActions>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/modal';
import TemplateActions from '@/components/template-actions';
import TemplateDetails from '@/components/template-details';
import { Template } from '@/components/template-viewer';
import { getLanguageName, useTranslation } from '@/i18n';
import { Locale } from '@/state';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  template: {
    type: Template,
    required: true
  },
  showCreateResume: Boolean,
  resumeCount: Number
});

const emit = defineEmits<{
  (e: 'hidden'): void;
}>();

// global states
const appLocale = inject(Locale);

// computed
const name = computed(function (): string {
  return props.template.name;
});

const locale = computed(function (): string {
  return getLanguageName(props.template.locale, appLocale.value);
});

const primaryAction = computed(function () {
  if (props.showCreateResume) {
    return undefined;
  } else {
    return t('template-browser.label.close');
  }
});

const primaryActionVariant = computed(function () {
  if (props.showCreateResume) {
    return undefined;
  } else {
    return 'secondary';
  }
});
</script>
