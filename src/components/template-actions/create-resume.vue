<template>
  <Modal :title="t('new-resume.label.modal-title')" body-class="pb-0" :ok-disabled="!valid" v3 @ok="create" @hidden="hidden" v-slot="{ ok }">
    <BForm novalidate @submit.prevent="ok()">
      <!-- name -->
      <BFormGroup
        :label="t('resume-name.label.input')"
        :description="t('resume-name.message.description')"
        :invalid-feedback="t('resume-name.message.invalid')"
        :state="nameState"
        label-for="resume-name">
        <BFormInput id="resume-name" :state="nameState" v-model="name"></BFormInput>
      </BFormGroup>
      <!-- privacy & terms -->
      <BFormGroup v-if="isGuest && showTOS">
        <BFormCheckbox v-model="tos">
          <i18n path="template-actions.message.tos-acceptant" :tag="false">
            <template #tos>
              <a href="https://ultima-legal-us.s3.us-west-2.amazonaws.com/terms.pdf" target="_blank">{{ t('template-actions.label.tos') }}</a>
            </template>
            <template #privacy>
              <a href="https://ultima-legal-us.s3.us-west-2.amazonaws.com/privacy.pdf" target="_blank">{{ t('template-actions.label.privacy-policy') }}</a>
            </template>
          </i18n>
        </BFormCheckbox>
      </BFormGroup>
    </BForm>
  </Modal>
</template>

<script setup lang="ts">
import { BForm, BFormCheckbox, BFormGroup, BFormInput } from 'bootstrap-vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { ClientKey, isValidResumeName } from '@/clients/rest';
import { CreateResume, Resume, ResumeService } from '@/clients/resume';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { getCaptchaKey, StorageKey } from '@/config';
import { CreateGuestSession, GuestSessionEndpoint } from '@/rest-endpoints/guest-session';
import { Alert, Router } from '@/services';
import { Source } from '@/store';
import { inject } from '@/util/injector';
import { ULID } from '@/util/ulid';

const { t } = useI18n();

// props & emit
const props = defineProps({
  templateId: {
    type: ULID,
    required: true
  },
  isGuest: Boolean
});

const emit = defineEmits<{
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);
const router = inject(Router);

// local states
const name = ref('');
const tos = ref(false);
const showTOS = localStorage.getItem(StorageKey.GuestTOSAcceptance) === null;

// computed
const nameState = computed(function () {
  return isValidResumeName(name.value.trim()) ? null : false;
});

const valid = computed(function () {
  return nameState.value === null && (!props.isGuest || !showTOS || tos.value);
});

// functions
const create = async function (proceed: Proceed, busy: ToggleBusy) {
  if (!valid.value) {
    return;
  }

  // create a guest session
  if (props.isGuest) {
    busy(true);

    // load captcha
    let captcha;

    try {
      captcha = await grecaptcha.execute(getCaptchaKey(), { action: 'guest_session_create' });
    } catch (e) {
      alert.error(Source.App, () => t('template-actions.message.captcha-error'), e as Error);
      busy(false);
      return;
    }

    // create a new session
    const ge = new GuestSessionEndpoint(rest);
    const req = new CreateGuestSession(captcha);
    let token;

    try {
      token = await ge.create(req);
    } catch (e) {
      const error = e as Error;
      alert.error(Source.Server, () => t('template-actions.message.create-guest-session-error', { error }), error);
      busy(false);
      return;
    }

    // store token
    try {
      localStorage.setItem(StorageKey.GuestToken, token);
    } catch (e) {
      alert.error(Source.App, () => t('template-actions.message.write-guest-token-error'), e as Error);
      busy(false);
      return;
    }

    rest.accessToken = token;
  } else {
    busy(true);
  }

  // create resume
  const re = new ResumeService(rest);
  const req = new CreateResume(name.value.trim(), props.templateId, null);

  try {
    await re.create(req);
  } catch (e) {
    alert.error(Source.Server, () => t('new-resume.message.create-error'), e as Error);
    busy(false);
    return;
  }

  // reload page instead of normal routing due to we might be opened from template detail modal
  window.location.href = '/';
};

const hidden = function (r: Resume | undefined) {
  emit('hidden');

  if (r) {
    router.push({ name: 'resume-list' });
  }
}
</script>
