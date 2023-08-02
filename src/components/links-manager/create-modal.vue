<template>
  <Modal :title="t('create-resume-link.label.header')" body-class="pb-0" :ok-disabled="!valid" v3 @ok="ok" @hidden="hidden" v-slot="{ ok }">
    <!-- create form -->
    <BForm novalidate @submit.prevent="ok">
      <!-- name -->
      <BFormGroup
        :label="t('resume-link-name.label.header')"
        :description="t('resume-link-name.message.description')"
        :state="nameState"
        :invalid-feedback="t('resume-link-name.message.invalid-input')"
        label-for="new-link-name">
        <BFormInput id="new-link-name" :state="nameState" v-model="name"></BFormInput>
      </BFormGroup>
      <!-- censorship -->
      <BFormGroup :label="t('links-manager.label.new-censorship-label')" :description="t('links-manager.message.new-censorship')" label-for="new-link-censorship">
        <BButton id="new-link-censorship" variant="outline-secondary" size="sm" block @click="editCensorships">
          {{ t('links-manager.label.new-censorship-edit') }}
        </BButton>
      </BFormGroup>
    </BForm>
    <!-- modals -->
    <EditCensorships v-if="editingCensorships" :context="editingCensorships" @input="updateCensorships" @hidden="editingCensorships = null"></EditCensorships>
  </Modal>
</template>

<script setup lang="ts">
import { BButton, BForm, BFormGroup, BFormInput } from 'bootstrap-vue';
import { computed, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { ClientKey } from '@/clients/rest';
import { CreateResumeLink, ResumeInfo, ResumeLink, ResumeService } from '@/clients/resume';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { Alert } from '@/services';
import { Source } from '@/store';
import { inject } from '@/util/injector';
import { Uuid } from '@/util/uuid';
import EditCensorships from './edit-censorships.vue';
import { EditCensorshipsContext } from './models';

const { t } = useI18n();

// props & emit
const props = defineProps({
  resume: {
    type: ResumeInfo,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'input', v: ResumeLink): void;
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// local states
const name = ref('');
const editingCensorships: Ref<EditCensorshipsContext | null> = ref(null);
const censorships: Ref<Set<string>> = ref(new Set());

// computed
const trimmedName = computed(function () {
  return name.value.trim();
});

const nameState = computed(function () {
  const v = trimmedName.value;

  return (v.length > 0 && v.length <= 100) ? null : false;
});

const valid = computed(function () {
  return nameState.value === null;
});

// functions
const editCensorships = function () {
  editingCensorships.value = new EditCensorshipsContext(props.resume, censorships.value);
};

const updateCensorships = function (v: Set<string>) {
  censorships.value = v;
};

const ok = async function (proceed: Proceed, busy: ToggleBusy) {
  let link;

  if (!valid.value) {
    return;
  }

  busy(true);

  try {
    const service = new ResumeService(rest);
    const req = new CreateResumeLink(trimmedName.value, [...censorships.value]);

    link = await service.createLink(new Uuid(props.resume.id), req);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('links-manager.message.new-link-error', { error }), error);
    busy(false);
    return;
  }

  proceed(link);
};

const hidden = function (result: unknown) {
  if (result instanceof ResumeLink) {
    emit('input', result);
  }

  emit('hidden');
};
</script>
