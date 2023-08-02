<template>
  <Page>
    <!-- name -->
    <BRow v-if="template">
      <BCol>
        <h3>
          {{ templateName }}
          <small class="text-muted text-nowrap">{{ getLanguageName(templateLocale, locale) }}</small>
        </h3>
      </BCol>
    </BRow>
    <!-- details -->
    <TemplateDetails v-if="template" :data="template" preview-class="mb-2" details-class="mb-2" show-resume-count show-locale></TemplateDetails>
    <!-- actions -->
    <BFormRow v-if="template">
      <BCol class="d-flex justify-content-end">
        <!-- actions -->
        <TemplateActions :template="template" :resume-count="resumes" class="mb-3"></TemplateActions>
      </BCol>
    </BFormRow>
  </Page>
</template>

<script setup lang="ts">
import { BCol, BFormRow, BRow } from 'bootstrap-vue';
import { computed, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { ClientKey } from '@/clients/rest';
import { ResumeService } from '@/clients/resume';
import { TemplateRegistrationService } from '@/clients/template-registration';
import Page from '@/components/page';
import TemplateActions from '@/components/template-actions';
import TemplateDetails from '@/components/template-details';
import { Template } from '@/components/template-viewer';
import { getLanguageName } from '@/i18n';
import { Alert } from '@/services';
import { Locale, Session } from '@/state';
import { Source } from '@/store';
import { asyncInit } from '@/util/async-init';
import { inject } from '@/util/injector';
import { Uuid } from '@/util/uuid';

const { t } = useI18n();

// props & emit
const props = defineProps({
  templateId: {
    type: String,
    required: true
  }
});

const templateId = new Uuid(props.templateId);

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// global states
const locale = inject(Locale);
const session = inject(Session);

// local states
const template: Ref<Template | null> = ref(null);
const resumes: Ref<number | null> = ref(null);

// computed
const templateName = computed(function () {
  if (template.value) {
    return template.value.name;
  } else {
    throw new Error('No loaded template.');
  }
});

const templateLocale = computed(function () {
  if (template.value) {
    return template.value.locale;
  } else {
    throw new Error('No loaded template.');
  }
});

// fetch data
asyncInit(async function () {
  // load resume count
  if (session.value) {
    const e = new ResumeService(rest);

    try {
      resumes.value = (await e.list()).length;
    } catch (e) {
      const error = e as Error;
      alert.error(Source.Server, () => t('template.message.load-resume-error', { error }), error);
      return;
    }
  }

  // load registration
  const re = new TemplateRegistrationService(rest);
  let reg;

  try {
    reg = await re.get(templateId);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('template.message.load-registration-error', { error }), error);
    return;
  }

  // load latest release
  let rel;

  try {
    rel = await re.listReleases(templateId);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('template.message.load-releases-error', { error }), error);
    return;
  }

  if (!rel.length) {
    alert.error(Source.App, () => t('template.message.not-releases'));
    return;
  }

  rel = rel[0];

  // load license
  let li;

  if (session.value) {
    try {
      li = await re.getLicense(templateId);
    } catch (e) {
      const error = e as Error;
      alert.error(Source.Server, () => t('template.message.load-license-error', { error }), error);
      li = null;
    }
  } else {
    li = null;
  }

  // trigger reactivity
  template.value = new Template(reg.id, reg.userId, reg.name, reg.description, reg.website, reg.language, rel.category, reg.prices, reg.resumeCount, rel.id, rel.preview, li);
});
</script>
