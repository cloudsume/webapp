<template>
  <div>
    <!-- contact -->
    <BFormGroup :label="t('feedback-modal.label.contact')" label-for="feedback-contact">
      <BFormInput :placeholder="t('feedback-modal.label.contact-ph')" id="feedback-contact" type="email" :value="value" @update="emit('input', $event)">
      </BFormInput>
    </BFormGroup>
    <!-- tos & pp -->
    <p v-if="showTos">
      <i18n tag="small" path="feedback-modal.message.tos-notice" class="text-muted">
        <template #tos>
          <a href="https://ultima-legal-us.s3.us-west-2.amazonaws.com/terms.pdf" target="_blank">{{ t('feedback-modal.label.tos') }}</a>
        </template>
        <template #pp>
          <a href="https://ultima-legal-us.s3.us-west-2.amazonaws.com/privacy.pdf" target="_blank">{{ t('feedback-modal.label.pp') }}</a>
        </template>
      </i18n>
    </p>
  </div>
</template>

<script setup lang="ts">
import { BFormGroup, BFormInput } from 'bootstrap-vue';
import { useTranslation } from '@/i18n';

const { t } = useTranslation();

// props & emit
defineProps({
  showTos: Boolean,
  value: String
});

const emit = defineEmits<{
  (e: 'input', v: string): void;
}>();
</script>
