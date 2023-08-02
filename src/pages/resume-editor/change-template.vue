<template>
  <Modal :title="t('resume-editor.label.change-template-title')" body-class="pb-0" size="xl" initial-busy v3 @ok="ok" @hide="hide" @hidden="hidden">
    <!-- body -->
    <template #default="{ ok, busy }">
      <TemplateBrowser :filter="filter" md="12" lg="6" xl="4" @ready="browserReady($event, busy)" @fetching="fetching = $event" v-slot="{ template }">
        <BButton :disabled="fetching" variant="primary" class="mt-auto" @click="ok(template)">
          {{ t('use-resume-template.label.radio') }}
        </BButton>
      </TemplateBrowser>
    </template>
    <!-- footer -->
    <template #modal-footer="{ cancel }">
      <JobFilter :disabled="fetching" :filter="hasTemplate" class="flex-grow-1" v-model="jobFilter"></JobFilter>
      <BButton :disabled="fetching" @click="cancel">{{ t('cancel-browse-resume-template.label.button') }}</BButton>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { BButton, BvModalEvent } from 'bootstrap-vue';
import { computed, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { ClientKey } from '@/clients/rest';
import { ResumeService } from '@/clients/resume';
import { RegistrationCategory, TemplateLicenseStatus, TemplateRegistration } from '@/clients/template-registration';
import JobFilter from '@/components/job-filter';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import TemplateBrowser, { Template as BrowserTemplate } from '@/components/template-browser';
import { Job } from '@/rest-endpoints/job';
import { Alert } from '@/services';
import { Session } from '@/state';
import { Source } from '@/store';
import { inject } from '@/util/injector';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';
import { Resume, Template } from './models';

const { t } = useI18n();

// props & emit
const props = defineProps({
  resume: {
    type: Resume,
    required: true
  },
  current: {
    type: Template,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'hidden', t: ULID | null): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// global states
const session = inject(Session);

// local states
const availableJobs: Ref<Set<string>> = ref(new Set());
const ready = ref(false);
const fetching = ref(false);
const jobFilter: Ref<Uuid | undefined> = ref(undefined);

let saving = false;

// computed
const filter = computed(function () {
  const job = jobFilter.value;

  return (r: TemplateRegistration) => {
    // filter out current template and template with different language
    const c = props.current;

    if (!r.latestRelease) {
      throw new Error(`No latest release for template ${r.id}.`);
    }

    if (r.latestRelease.equals(c.id) || r.language !== c.language) {
      return false;
    }

    // user filters
    if (job && !r.applicableJobs.some(id => id.equals(job))) {
      return false;
    }

    return true;
  }
});

// functions
const ok = async function (proceed: Proceed, busy: ToggleBusy, result: BrowserTemplate) {
  // ask user to confirm if this resume have public link and user does not have a license for selected template
  if (props.resume.links.length && result.category === RegistrationCategory.Paid) {
    const user = session.value?.userId;

    if (!user || !result.user.equals(user) && result.license?.status !== TemplateLicenseStatus.Valid) {
      if (!window.confirm(t('resume-editor.message.link-warning') as string)) {
        return;
      }
    }
  }

  // invoke api
  const service = new ResumeService(rest);

  saving = true;
  busy(true);

  try {
    await service.setTemplate(new Uuid(props.resume.id), result.template);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('resume-editor.message.change-template-error', { error }), error);
    busy(false);
    return;
  } finally {
    saving = false;
  }

  proceed(result.template);
};

const hide = function (e: BvModalEvent) {
  if (!ready.value || fetching.value || saving) {
    e.preventDefault();
  }
};

const hidden = function (result: unknown) {
  emit('hidden', result instanceof ULID ? result : null);
};

const browserReady = function (registrations: TemplateRegistration[] | null, busy: ToggleBusy) {
  if (registrations) {
    const jobs = new Set<string>();

    for (const r of registrations) {
      for (const j of r.applicableJobs) {
        jobs.add(j.toString());
      }
    }

    availableJobs.value = jobs;
  }

  ready.value = true;
  busy(false);
};

const hasTemplate = function (j: Job) {
  return availableJobs.value.has(j.id.toString());
};
</script>
