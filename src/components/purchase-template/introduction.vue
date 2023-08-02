<template>
  <div>
    <!-- primary message -->
    <p>
      {{ t('purchase-template.message.introduction', { resume: resumeName, template: templateName }) }}
      <template v-if="!isVerifiedAccount">
        <strong v-if="isPermanentAccount">
          {{ t('purchase-template.message.unverified-warning') }}
        </strong>
        <strong v-else>
          {{ t('purchase-template.message.temporary-warning') }}
        </strong>
      </template>
    </p>
    <!-- additional message -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue';
import { ClientKey } from '@/clients/rest';
import { ResumeInfo } from '@/clients/resume';
import { Template, TemplateService } from '@/clients/template';
import { TemplateRegistration, TemplateRegistrationService } from '@/clients/template-registration';
import { ResultFactory } from '@/components/wizard-modal';
import { useTranslation } from '@/i18n';
import { Alert } from '@/services';
import { Session } from '@/state';
import { Source } from '@/store';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';
import { ULID } from '@/util/ulid';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  resume: {
    type: ResumeInfo,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'ready'): void;
  (e: 'input', v: ResultFactory): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// global states
const session = inject(Session);

// local states
const registration: Ref<TemplateRegistration | null> =  ref(null);

// computed
const templateName = computed(function (): string {
  return registration.value ? registration.value.name : '';
});

const resumeName = computed(function (): string {
  return props.resume.name;
});

const isVerifiedAccount = computed(function (): boolean {
  return typeof session.value?.verifiedEmail === 'string';
});

const isPermanentAccount = computed(function (): boolean {
  return session.value?.isGuest === false;
});

// functions
const getResult = function (): unknown {
  return registration.value;
}

// lifecycle hooks
onMounted(async function () {
  const ts = new TemplateService(rest);
  const rs = new TemplateRegistrationService(rest);

  // load template
  let template: Template;

  try {
    template = await ts.get(new ULID(props.resume.template));
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('purchase-template.message.fetch-template-error', { template: props.resume.template, error }), error);
    emit('ready');
    return;
  }

  // load registration
  try {
    registration.value = await rs.get(template.registrationId);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('purchase-template.message.fetch-template-error', { template: template.registrationId, error }), error);
    return;
  } finally {
    emit('ready');
  }

  emit('input', getResult);
});
</script>
