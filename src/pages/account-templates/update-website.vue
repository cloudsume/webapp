<template>
  <Modal :title="title" :ok-disabled="!canSave" body-class="pb-0" v3 @ok="save" @hidden="hidden" v-slot="{ ok }">
    <BForm novalidate @submit.prevent="ok()">
      <BFormGroup
        :label="t('account-templates.label.new-registration-website')"
        :description="t('account-templates.message.new-registration-website')"
        :state="state"
        :invalid-feedback="t('account-templates.message.invalid-registration-website')"
        label-for="template-website-input">
        <BFormInput :state="state" v-model="value" id="template-website-input" type="url"></BFormInput>
      </BFormGroup>
    </BForm>
  </Modal>
</template>

<script setup lang="ts">
import { BForm, BFormGroup, BFormInput } from 'bootstrap-vue';
import { ref } from 'vue';
import { ClientKey } from '@/clients/rest';
import { TemplateRegistrationService } from '@/clients/template-registration';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { useTranslation } from '@/i18n';
import { Alert } from '@/services';
import { Source } from '@/store';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';
import { Template } from './models';
import { isWebsiteValid } from './utils';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  template: {
    type: Template,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'input', v: string | null): void;
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// local states
const original = props.template.website || '';
const value = ref(original);

// computed
const title = computed(function () {
  return props.template.name;
});

const trimmedValue = computed(function () {
  return value.value.trim();
});

const state = computed(function () {
  const v = trimmedValue.value.trim();

  if (!v || isWebsiteValid(v)) {
    return null;
  }

  return false;
});

const canSave = computed(function () {
  return trimmedValue.value !== original && state.value !== false;
});

// functions
const save = async function (proceed: Proceed, busy: ToggleBusy) {
  if (!canSave.value) {
    return;
  }

  // invoke backend
  const value = trimmedValue.value || null;

  busy(true);

  try {
    const ts = new TemplateRegistrationService(rest);
    await ts.setWebsite(props.template.id, value);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('account-templates.message.update-website-error', { error }), error);
    busy(false);
    return;
  }

  proceed(value);
};

const hidden = function (result: unknown) {
  if (typeof result === 'string' || result === null) {
    emit('input', result);
  }

  emit('hidden');
};
</script>
