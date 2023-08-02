<template>
  <Modal :title="t('feedback-modal.label.title')" :ok-disabled="!canSubmit" body-class="pb-0" v3 @ok="ok" @hidden="hidden" v-slot="{}">
    <!-- satisfaction -->
    <BFormGroup :label="t('feedback-modal.label.score')">
      <BFormRadioGroup button-variant="outline-secondary" v-model="score" buttons>
        <BFormRadio :value="0">
          <BIconEmojiAngry></BIconEmojiAngry>
          {{ t('feedback-modal.label.score-bad') }}
        </BFormRadio>
        <BFormRadio :value="4">
          <BIconEmojiSmile></BIconEmojiSmile>
          {{ t('feedback-modal.label.score-okay') }}
        </BFormRadio>
        <BFormRadio :value="9">
          <BIconEmojiLaughing></BIconEmojiLaughing>
          {{ t('feedback-modal.label.score-good') }}
        </BFormRadio>
      </BFormRadioGroup>
    </BFormGroup>
    <!-- detail -->
    <BFormGroup :label="t('feedback-modal.label.detail')" :state="detailState" label-for="feedback-detail">
      <BFormTextarea :state="detailState" :placeholder="t('feedback-modal.label.detail-ph')" id="feedback-detail" rows="5" v-model="detail"></BFormTextarea>
    </BFormGroup>
    <!-- contact -->
    <ContactAuth v-if="session" v-model="contact"></ContactAuth>
    <ContactGuest v-else :show-tos="showTOS" v-model="contact"></ContactGuest>
  </Modal>
</template>

<script setup lang="ts">
import { BFormGroup, BFormRadio, BFormRadioGroup, BFormTextarea, BIconEmojiAngry, BIconEmojiLaughing, BIconEmojiSmile } from 'bootstrap-vue';
import { ref, Ref } from 'vue';
import { ClientKey } from '@/clients/rest';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { getCaptchaKey, StorageKey } from '@/config';
import { useTranslation } from '@/i18n';
import { CreateFeedback, FeedbackAPI } from '@/rest/feedback';
import { Alert } from '@/services';
import { Session } from '@/state';
import { Source } from '@/store';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';
import ContactAuth from './contact-auth.vue';
import ContactGuest from './contact-guest.vue';

const { t } = useTranslation();

// props & emit
const emit = defineEmits<{
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// global states
const session = inject(Session);

// local states
const score: Ref<number | null> = ref(null);
const detail = ref('');
const contact = ref('');
const showTOS = localStorage.getItem(StorageKey.GuestTOSAcceptance) === null;

// computed
const trimmedDetail = computed(function () {
  return detail.value.trim();
})

const detailState = computed(function () {
  return trimmedDetail.value.length > 10000 ? false : null;
});

const hasErrors = computed(function () {
  return detailState.value === false;
});

const canSubmit = computed(function () {
  return !hasErrors.value && (score.value !== null || trimmedDetail.value.length > 0);
});

// functions
const ok = async function (proceed: Proceed, busy: ToggleBusy) {
  // store tos acceptance
  if (!session.value && showTOS) {
    localStorage.setItem(StorageKey.GuestTOSAcceptance, new Date().toJSON());
  }

  // get captcha token
  let captcha;

  busy(true);

  try {
    captcha = await grecaptcha.execute(getCaptchaKey(), { action: 'feedback_create' });
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('feedback-modal.message.captcha-error'), error);
    busy(false);
    return;
  }

  // submit feedback
  try {
    const api = new FeedbackAPI(rest);
    const req = new CreateFeedback(score.value, trimmedDetail.value || null, contact.value.trim() || null, captcha);
    await api.create(req);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('feedback-modal.message.submit-error', { error }), error);
    busy(false);
    return;
  }

  proceed();
};

const hidden = function () {
  emit('hidden');
};
</script>
