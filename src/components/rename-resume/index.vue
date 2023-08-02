<template>
  <Modal :title="t('rename-resume.label.title')" :ok-disabled="!canSave" body-class="pb-0" v3 @ok="ok" @hidden="hidden" v-slot="{ ok }">
    <BForm novalidate @submit.prevent="ok()">
      <BFormGroup
        :label="t('rename-resume.label.new-name')"
        :description="t('rename-resume.message.new-name-description')"
        :state="nameState"
        :invalid-feedback="t('rename-resume.message.invalid-name')"
        label-for="new-resume-name">
        <BFormInput id="new-resume-name" :state="nameState" v-model="name"></BFormInput>
      </BFormGroup>
    </BForm>
  </Modal>
</template>

<script setup lang="ts">
import { BForm, BFormGroup, BFormInput } from 'bootstrap-vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { ClientKey, isValidResumeName } from '@/clients/rest';
import { ResumeService } from '@/clients/resume';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { Alert } from '@/services';
import { Source } from '@/store';
import { inject } from '@/util/injector';
import { Uuid } from '@/util/uuid';

const { t } = useI18n();

// props & emit
const props = defineProps({
  resumeId: {
    type: Uuid,
    required: true
  },
  current: {
    type: String,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'hidden', n: string | null): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// local states
const name = ref(props.current);

// computed
const trimmedName = computed(function () {
  return name.value.trim();
});

const nameState = computed(function () {
  return isValidResumeName(trimmedName.value) ? null : false;
});

const canSave = computed(function () {
  return trimmedName.value !== props.current;
});

// functions
const ok = async function (proceed: Proceed, busy: ToggleBusy) {
  if (!canSave.value) {
    return;
  }

  const service = new ResumeService(rest);

  busy(true);

  try {
    await service.setName(props.resumeId, trimmedName.value);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('rename-resume.message.rename-error', { error }), error);
    busy(false);
    return;
  }

  proceed(trimmedName.value);
};

const hidden = function (result: unknown) {
  emit('hidden', typeof result === 'string' ? result : null);
};
</script>
