<template>
  <Modal :title="title" :ok-disabled="!canSave" body-class="pb-0" initial-busy v3 @shown="shown" @ok="save" @hidden="hidden" v-slot="{}">
    <BFormGroup
      :label="t('account-templates.label.new-registration-jobs')"
      :description="t('account-templates.message.new-registration-jobs')"
      :state="state"
      :invalid-feedback="t('account-templates.message.invalid-registration-jobs')"
      label-for="template-jobs-input">
      <BFormTags
        :state="state"
        v-model="selectedJobs"
        id="template-jobs-input"
        add-on-change
        no-outer-focus
        v-slot="{ tags, inputAttrs, inputHandlers, disabled, removeTag }">
        <!-- selected tags -->
        <ul v-if="tags.length" class="list-inline d-inline-block mb-2">
          <li v-for="tag of tags" :key="tag" class="list-inline-item">
            <BFormTag :title="getJobName(tag)" :disabled="disabled || !canRemove(tag)" variant="info" @remove="removeTag(tag)"></BFormTag>
          </li>
        </ul>
        <!-- select -->
        <BFormSelect v-bind="inputAttrs" v-bind:disabled="disabled" v-bind:options="availableJobs" v-on="inputHandlers">
          <template #first>
            <BFormSelectOption value="" disabled>{{ t('account-templates.label.new-registration-jobs-browse') }}</BFormSelectOption>
          </template>
        </BFormSelect>
      </BFormTags>
    </BFormGroup>
  </Modal>
</template>

<script setup lang="ts">
import { BFormGroup, BFormSelect, BFormSelectOption, BFormTag, BFormTags } from 'bootstrap-vue';
import { ref, Ref } from 'vue';
import { ClientKey } from '@/clients/rest';
import { TemplateRegistrationService } from '@/clients/template-registration';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { useTranslation } from '@/i18n';
import { Job, JobEndpoint } from '@/rest-endpoints/job';
import { Alert } from '@/services';
import { Locale } from '@/state';
import { Source } from '@/store';
import { bind } from '@/util/binder';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';
import { Uuid } from '@/util/uuid';
import { Template } from './models';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  template: {
    type: Template,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'input', v: Uuid[]): void;
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// global states
const locale = inject(Locale);

// local states
const selectedJobs: Ref<string[]> = ref([]);
const jobs = new Map<string, Job>();

// computed
const title = computed(function () {
  return props.template.name;
});

const published = computed(function () {
  return props.template.published;
});

const availableJobs = computed({ locale }, function () {
  // fill all non-selected jobs
  const selected = new Set(selectedJobs.value);
  const result = new Array<{ text: string, value: string }>();

  for (const [id, job] of jobs) {
    if (!selected.has(id)) {
      result.push({ text: job.name, value: id });
    }
  }

  // sort
  const locale = this.locale.value;

  result.sort((a, b) => a.text.localeCompare(b.text, locale));

  return result;
});

const state = computed(function () {
  const items = selectedJobs.value.length;

  return (!items || items > 10) ? false : null;
});

const canSave = computed({ selectedJobs }, function () {
  // short circuit if there is an error
  if (state.value === false) {
    return false;
  }

  // check if selected job has been changed
  const selected = new Set(this.selectedJobs.value);
  const current = props.template.applicableJobs;

  if (selected.size !== current.length) {
    return true;
  }

  for (const c of current) {
    if (!selected.has(c.toString())) {
      return true;
    }
  }

  return false;
});

// functions
const shown = bind({ jobs }, async function (busy: ToggleBusy) {
  // load jobs
  let jobs;

  try {
    const ep = new JobEndpoint(rest);
    jobs = await ep.list();
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('account-templates.message.fetch-jobs-error', { error }), error);
    return;
  } finally {
    busy(false);
  }

  // index job data
  for (const j of jobs) {
    this.jobs.set(j.id.toString(), j);
  }

  // populate selected jobs
  selectedJobs.value = props.template.applicableJobs.map(id => id.toString());
});

const getJobName = function (id: string) {
  const j = jobs.get(id);

  if (!j) {
    throw new Error(`Unknown job ${id}.`);
  }

  return j.name;
};

const canRemove = function (id: string) {
  // user can replace any applicable jobs if the template is not published yet
  if (!published.value) {
    return true;
  }

  // if the template is already published the user can add, but not remove
  for (const j of props.template.applicableJobs) {
    if (id === j.toString()) {
      return false;
    }
  }

  return true;
}

const save = async function (proceed: Proceed, busy: ToggleBusy) {
  if (!canSave.value) {
    return;
  }

  // check mode of update
  const id = props.template.id;
  const selected = selectedJobs.value;
  const current = props.template.applicableJobs;
  const ts = new TemplateRegistrationService(rest);
  const error = function (error: Error) {
    alert.error(Source.Server, () => t('account-templates.message.update-jobs-error', { error }), error);
    busy(false);
  };

  busy(true);

  if (published.value) {
    // get jobs to append
    const update = new Array<Uuid>();

    for (const s of selected) {
      const id = new Uuid(s);

      if (current.find(c => id.equals(c))) {
        continue;
      }

      update.push(id);
    }

    // append applicable job
    try {
      await ts.addApplicableJobs(id, update);
    } catch (e) {
      error(e as Error);
      return;
    }
  } else {
    // overwrite applicable jobs
    try {
      await ts.setApplicableJobs(id, selected.map(id => new Uuid(id)));
    } catch (e) {
      error(e as Error);
      return;
    }
  }

  proceed(selected.map(id => new Uuid(id)));
};

const hidden = function (result: unknown) {
  if (Array.isArray(result)) {
    emit('input', result);
  }

  emit('hidden');
};
</script>
