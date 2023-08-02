<template>
  <Page>
    <!-- filters -->
    <BFormRow>
      <!-- job -->
      <BCol cols="12" md="8">
        <JobFilter class="mb-2 mb-md-3" :filter="hasTemplate" :disabled="busy" v-model="jobFilter"></JobFilter>
      </BCol>
      <!-- locale -->
      <BCol cols="12" md="4">
        <BFormSelect class="mb-3" :disabled="busy" :options="locales" v-model="localeFilter"></BFormSelect>
      </BCol>
    </BFormRow>
    <!-- template list -->
    <TemplateBrowser v-if="!session || resumes !== undefined"
      :resume-count="resumes"
      :filter="filter"
      md="12"
      lg="6"
      xl="4"
      show-create-resume
      @ready="browserReady"
      @fetching="busy = $event"
      v-slot="p">
      <TemplateActions class="mt-auto" :template="p.template" :resume-count="resumes" block></TemplateActions>
    </TemplateBrowser>
  </Page>
</template>

<script setup lang="ts">
import { BCol, BFormRow, BFormSelect } from 'bootstrap-vue';
import { computed, ref, Ref } from 'vue';
import { ClientKey } from '@/clients/rest';
import { ResumeService } from '@/clients/resume';
import { TemplateRegistration } from '@/clients/template-registration';
import JobFilter from '@/components/job-filter';
import Page from '@/components/page';
import TemplateActions from '@/components/template-actions';
import TemplateBrowser from '@/components/template-browser';
import { getLanguageName, useTranslation } from '@/i18n';
import { Job } from '@/rest-endpoints/job';
import { Loading, Locale, Session } from '@/state';
import { asyncInit } from '@/util/async-init';
import { inject } from '@/util/injector';
import { Uuid } from '@/util/uuid';

const { t } = useTranslation();

// global states
const loading = inject(Loading);
const locale = inject(Locale);
const session = inject(Session);
const rest = inject(ClientKey);

// local states
const availableJobs: Ref<Set<string>> = ref(new Set());
const availableLocales: Ref<Set<string>> = ref(new Set());
const resumes: Ref<number | undefined> = ref(undefined);
const jobFilter: Ref<Uuid | undefined> = ref(undefined);
const localeFilter = ref('');
const busy = ref(false);

// computed
const locales = computed(function () {
  // populate items from template locales
  const items = new Array<{ text: string, value: string }>();

  for (const tag of availableLocales.value) {
    items.push({ text: getLanguageName(tag, locale.value), value: tag });
  }

  items.sort((a, b) => a.text.localeCompare(b.text, locale.value));

  // insert any locale to the top
  items.unshift({
    text: t('locale-filter.label.any-locale'),
    value: ''
  });

  return items;
});

const filter = computed(function () {
  const job = jobFilter.value;
  const locale = localeFilter.value;

  if (!job && !locale) {
    return null;
  }

  return (r: TemplateRegistration): boolean => {
    if (job && !r.applicableJobs.some(id => id.equals(job))) {
      return false;
    } else if (locale && r.language !== locale) {
      return false;
    }

    return true;
  };
});

// functions
const hasTemplate = function (j: Job) {
  return availableJobs.value.has(j.id.toString());
};

const browserReady = function (templates: TemplateRegistration[] | null) {
  const jobs = new Set<string>();
  const locales = new Set<string>();

  for (const t of templates || []) {
    for (const j of t.applicableJobs) {
      jobs.add(j.toString());
    }

    locales.add(t.language);
  }

  availableJobs.value = jobs;
  availableLocales.value = locales;
  loading.value--;
};

// lifecycle hooks
if (session.value) {
  asyncInit(async function () {
    const service = new ResumeService(rest);

    try {
      resumes.value = (await service.list()).length;
    } catch (e) {
      // TODO: display alert
      return;
    }
  });
}

// do not hide loading until template browser is ready
loading.value++;
</script>
