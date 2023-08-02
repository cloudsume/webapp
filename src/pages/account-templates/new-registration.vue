<template>
  <Modal :title="t('account-templates.label.new-registration-title')" body-class="pb-0" v3 initial-busy @shown="shown" @ok="ok" @hidden="hidden">
    <!-- form -->
    <template #default="{ ok }">
      <BForm novalidate @submit.prevent="ok()">
        <!-- name -->
        <BFormGroup
          :label="t('account-templates.label.new-registration-name')"
          :description="t('account-templates.message.new-registration-name')"
          :state="nameState"
          :invalid-feedback="t('account-templates.message.invalid-registration-name')"
          label-for="registration-name">
          <BFormInput id="registration-name" :state="nameState" v-model="name"></BFormInput>
        </BFormGroup>
        <!-- country -->
        <BFormGroup
          :label="t('account-templates.label.new-registration-country')"
          :description="t('account-templates.message.new-registration-country')"
          :state="countryState"
          :invalid-feedback="t('account-templates.message.new-registration-country-error')"
          label-for="registration-country">
          <CountrySelector id="registration-country" :state="countryState" :filter="countriesFilter" reset-invalid v-model="country"></CountrySelector>
        </BFormGroup>
        <!-- language -->
        <BFormGroup
          :label="t('account-templates.label.new-registration-culture')"
          :description="t('account-templates.message.new-registration-culture')"
          :state="languageState"
          :invalid-feedback="t('account-templates.message.invalid-registration-culture')"
          label-for="registration-language">
          <LanguageSelector id="registration-language" :state="languageState" :filter="languagesFilter" reset-invalid v-model="language"></LanguageSelector>
        </BFormGroup>
        <!-- jobs -->
        <BFormGroup
          :label="t('account-templates.label.new-registration-jobs')"
          :description="t('account-templates.message.new-registration-jobs')"
          :state="applicableJobsState"
          :invalid-feedback="t('account-templates.message.invalid-registration-jobs')"
          label-for="registration-jobs">
          <BFormTags
            :value="applicableJobs"
            id="registration-jobs"
            :state="applicableJobsState"
            add-on-change
            no-outer-focus
            @input="updateApplicableJobs"
            v-slot="{ tags, inputAttrs, inputHandlers, disabled, removeTag }">
            <ul v-if="tags.length" class="list-inline d-inline-block mb-2">
              <li v-for="tag of tags" :key="tag" class="list-inline-item">
                <BFormTag :title="getJobName(tag)" :disabled="disabled" variant="info" @remove="removeTag(tag)"></BFormTag>
              </li>
            </ul>
            <BFormSelect v-bind="inputAttrs" v-bind:disabled="disabled" v-bind:options="selectableJobs" v-on="inputHandlers">
              <template #first>
                <option disabled value="">{{ t('account-templates.label.new-registration-jobs-browse') }}</option>
              </template>
            </BFormSelect>
          </BFormTags>
        </BFormGroup>
        <!-- preview job -->
        <BFormGroup
          :label="t('account-templates.label.preview-job')"
          :description="t('account-templates.message.preview-job')"
          label-for="registration-preview-job">
          <BFormSelect :options="previewJobs" id="registration-preview-job" v-model="previewJob">
            <template #first>
              <BFormSelectOption value="">{{ t('account-templates.label.system-preview-job') }}</BFormSelectOption>
            </template>
          </BFormSelect>
        </BFormGroup>
        <!-- website -->
        <BFormGroup
          :label="t('account-templates.label.new-registration-website')"
          :description="t('account-templates.message.new-registration-website')"
          :state="websiteState"
          :invalid-feedback="t('account-templates.message.invalid-registration-website')"
          label-for="registration-website">
          <BFormInput id="registration-website" :state="websiteState" type="url" v-model="website"></BFormInput>
        </BFormGroup>
        <!-- description -->
        <BFormGroup
          :label="t('account-templates.label.new-registration-desc')"
          :description="t('account-templates.message.new-registration-desc')"
          :state="descriptionState"
          :invalid-feedback="t('account-templates.message.invalid-registration-desc')"
          label-for="registration-desc">
          <BFormTextarea id="registration-desc" :state="descriptionState" rows="10" v-model="description"></BFormTextarea>
        </BFormGroup>
      </BForm>
    </template>
    <!-- footer -->
    <template #modal-footer="{ cancel, ok }">
      <BFormSelect v-model="category" class="flex-grow-1" style="width: auto">
        <BFormSelectOption :value="1">{{ t('account-templates.label.private-category') }}</BFormSelectOption>
        <BFormSelectOption :value="0">{{ t('account-templates.label.free-category') }}</BFormSelectOption>
        <BFormSelectOption :value="2">{{ t('account-templates.label.paid-category') }}</BFormSelectOption>
      </BFormSelect>
      <BButton @click="cancel">{{ t('account-templates.label.new-registration-cancel') }}</BButton>
      <BButton :disabled="!valid" variant="primary" @click="ok()">
        {{ t('account-templates.label.new-registration-submit') }}
      </BButton>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { parse as parseLocale } from 'bcp-47';
import { gt } from 'binary-search-bounds';
import { BButton, BForm, BFormGroup, BFormInput, BFormSelect, BFormSelectOption, BFormTag, BFormTags, BFormTextarea } from 'bootstrap-vue';
import { ref } from 'vue';
import { ClientKey } from '@/clients/rest';
import { RegisterTemplate, RegistrationCategory, TemplateRegistration, TemplateRegistrationService } from '@/clients/template-registration';
import CountrySelector from '@/components/country-selector';
import LanguageSelector from '@/components/language-selector';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { AllowedTemplateCultures } from '@/config';
import { useTranslation } from '@/i18n';
import { Job, JobEndpoint } from '@/rest-endpoints/job';
import { Alert } from '@/services';
import { Locale } from '@/state';
import { Source } from '@/store';
import { bind } from '@/util/binder';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';
import { getMapValue } from '@/util/map';
import { Uuid } from '@/util/uuid';
import { isWebsiteValid } from './utils';

const { t } = useTranslation();

// props & emit
const emit = defineEmits<{
  (e: 'input', v: TemplateRegistration): void;
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// global states
const locale = inject(Locale);

// local states
const name = ref('');
const country = ref('');
const language = ref('');
const applicableJobs = ref(new Array<string>());
const previewJob = ref('');
const website = ref('');
const description = ref('');
const category = ref(RegistrationCategory.Private);
const jobs = ref(new Map<string, Job>());
const languages = new Map<string, string[]>();

for (const tag of AllowedTemplateCultures) {
  const p = parseLocale(tag);
  let s = languages.get(p.region!);

  if (!s) {
    languages.set(p.region!, s = []);
  }

  s.push(p.language!);
}

// computed
const countriesFilter = computed({ language }, function () {
  // get list of allowed
  const language = this.language.value;
  let allowed: Set<string>;

  if (language) {
    let i = gt(AllowedTemplateCultures, language, (a, b) => a.localeCompare(b, undefined, { sensitivity: 'accent' }));

    allowed = new Set();

    for (; i < AllowedTemplateCultures.length; i++) {
      const p = parseLocale(AllowedTemplateCultures[i]);

      if (p.language !== language) {
        break;
      }

      allowed.add(p.region!);
    }
  } else {
    allowed = new Set(languages.keys());
  }

  // build the filter
  return function (id: string) {
    return allowed.has(id);
  };
});

const languagesFilter = computed({ country }, function () {
  // get list of allowed
  const country = this.country.value;
  let allowed: Set<string>;

  if (country) {
    allowed = new Set(languages.get(country));
  } else {
    allowed = new Set();

    for (const tags of languages.values()) {
      for (const tag of tags) {
        allowed.add(tag);
      }
    }
  }

  // build the filter
  return function (id: string) {
    return allowed.has(id);
  }
});

const selectableJobs = computed(function () {
  const selected = new Set(applicableJobs.value);
  const result = new Array<{ text: string, value: string }>();

  for (const [id, job] of jobs.value) {
    if (!selected.has(id)) {
      result.push({ text: job.name, value: id });
    }
  }

  return result;
});

const previewJobs = computed(function () {
  // populate items from selected jobs
  const result = new Array<{ text: string, value: string }>();

  for (const id of applicableJobs.value) {
    result.push({ text: getMapValue(jobs.value, id).name, value: id });
  }

  // sort items
  return result.sort((a, b) => a.text.localeCompare(b.text, locale.value));
});

const nameState = computed({ name }, function (): boolean | null {
  const name = this.name.value.trim();
  const valid = name.length > 0 && name.length <= 100;

  return valid ? null : false;
});

const countryState = computed(function (): boolean | null {
  return country.value ? null : false;
});

const languageState = computed(function (): boolean | null {
  return language.value ? null : false;
});

const applicableJobsState = computed(function (): boolean | null {
  const items = applicableJobs.value.length;

  return (!items || items > 10) ? false : null;
});

const websiteState = computed({ website }, function (): boolean | null {
  const website = this.website.value.trim();

  if (!website || isWebsiteValid(website)) {
    return null;
  }

  return false;
});

const descriptionState = computed(function (): boolean | null {
  return description.value.trim().length <= 10000 ? null : false;
});

const valid = computed(function (): boolean {
  return nameState.value === null &&
    countryState.value === null &&
    languageState.value === null &&
    applicableJobsState.value === null &&
    websiteState.value === null &&
    descriptionState.value === null;
});

// functions
const shown = bind({ jobs }, async function (busy: ToggleBusy) {
  // fetch jobs
  const ep = new JobEndpoint(rest);
  let jobs;

  try {
    jobs = await ep.list();
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('account-templates.message.fetch-jobs-error', { error }), error);
    return;
  } finally {
    busy(false);
  }

  // index jobs
  const index = new Map<string, Job>();
  const collator = new Intl.Collator(locale.value);

  for (const job of jobs.sort((a, b) => collator.compare(a.name, b.name))) {
    index.set(job.id.toString(), job);
  }

  this.jobs.value = index;
});

const getJobName = function (id: string): string {
  return getMapValue(jobs.value, id).name;
};

const updateApplicableJobs = function (v: string[]): void {
  applicableJobs.value = v;

  if (previewJob.value && v.length !== 1) {
    // clear preview job if it does not exists on applicable jobs
    if (!v.includes(previewJob.value)) {
      previewJob.value = '';
    }
  } else if (v.length === 1) {
    // select preview job to match with application job if only one application job available
    previewJob.value = v[0];
  }
};

const ok = bind({ name, description, website, previewJob, category }, async function (proceed: Proceed, busy: ToggleBusy) {
  if (!valid.value) {
    return;
  }

  // setup the request
  const service = new TemplateRegistrationService(rest);
  const name = this.name.value.trim();
  const desc = this.description.value.trim();
  const website = this.website.value.trim();
  const culture = `${language.value}-${country.value}`;
  const jobs = applicableJobs.value.map(id => new Uuid(id));
  const previewJob = this.previewJob.value ? new Uuid(this.previewJob.value) : null;
  const category = this.category.value;
  const req = new RegisterTemplate(name, desc ? desc : null, website ? website : null, culture, jobs, previewJob, category);

  // register
  let reg: TemplateRegistration;

  busy(true);

  try {
    reg = await service.register(req);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('account-templates.message.register-error', { error }), error);
    busy(false);
    return;
  }

  proceed(reg);
});

const hidden = function (r: unknown) {
  if (r instanceof TemplateRegistration) {
    emit('input', r);
  }

  emit('hidden');
};
</script>
