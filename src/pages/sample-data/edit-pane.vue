<template>
  <BCard no-body>
    <!-- header -->
    <template #header="{}">
      <h6 class="mb-0">{{ props.header }}</h6>
    </template>
    <!-- editor -->
    <template #default="{}">
      <keep-alive>
        <component
          :is="editor"
          :key="itemID"
          :id="`sample-editor-${itemID}`"
          :type="type"
          :lang="locale"
          :state="state"
          @result="emit('result-change', $event)"
          @change="emit('flags-change', $event)"
          @dirty="emit('dirty-change', $event)">
        </component>
      </keep-alive>
    </template>
    <!-- footer -->
    <template #footer="{}">
      <BFormSelect :options="parents || []" :disabled="!parents || saving" :value="parent" @change="updateParent">
        <template #first>
          <BFormSelectOption :value="null">
            {{ t('sample-data.label.disable-parent') }}
          </BFormSelectOption>
        </template>
      </BFormSelect>
    </template>
  </BCard>
</template>

<script setup lang="ts">
import { BCard, BFormSelect, BFormSelectOption } from 'bootstrap-vue';
import { Component, InjectionKey } from 'vue';
import AddressEditor from '@/components/address-editor';
import CertificateEditor from '@/components/certificate-editor';
import { ContextKey, DataFlags, DataType, ResultFactory } from '@/components/data-editor';
import EducationEditor from '@/components/education-editor';
import EmailEditor from '@/components/email-editor';
import ExperienceEditor from '@/components/experience-editor';
import GithubEditor from '@/components/github-editor';
import HeadlineEditor from '@/components/headline-editor';
import LanguageEditor from '@/components/language-editor';
import LinkedinEditor from '@/components/linkedin-editor';
import NameEditor from '@/components/name-editor';
import PhotoEditor from '@/components/photo-editor';
import SkillEditor from '@/components/skill-editor';
import SummaryEditor from '@/components/summary-editor';
import TelephoneEditor from '@/components/telephone-editor';
import WebsiteEditor from '@/components/website-editor';
import { useJobs } from '@/data/jobs';
import { getLanguageName, useTranslation } from '@/i18n';
import { SampleData } from '@/rest-endpoints/sample-data';
import { Locale } from '@/state';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';
import { Context, Item } from './models';

const jobs = useJobs();
const { t } = useTranslation();

// props & emit
const props = defineProps({
  item: {
    type: Item,
    required: true
  },
  header: {
    type: String,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'result-change', v: ResultFactory): void;
  (e: 'flags-change', v: DataFlags): void;
  (e: 'dirty-change', v: boolean): void;
  (e: 'parent-change', v: SampleData | null): void;
}>();

// global states
const appLocale = inject(Locale);

// component states
const context = inject(ContextKey as InjectionKey<Context>);

// computed
const saving = computed(function () {
  return context.saving;
});

const locale = computed(function () {
  const locale = context.locale;

  if (locale === null) {
    throw new Error('No locale has been selected.');
  }

  return locale;
});

const itemID = computed(function () {
  return props.item.id;
});

const type = computed(function () {
  return props.item.type;
});

const data = computed(function () {
  const data = props.item.data;

  if (!data) {
    throw new Error('No data has been associated with the item.');
  }

  return data;
});

const editor = computed(function (): Component {
  switch (type.value) {
    case DataType.Name:
      return NameEditor;
    case DataType.Headline:
      return HeadlineEditor;
    case DataType.Address:
      return AddressEditor;
    case DataType.Mobile:
      return TelephoneEditor;
    case DataType.Email:
      return EmailEditor;
    case DataType.LinkedIn:
      return LinkedinEditor;
    case DataType.GitHub:
      return GithubEditor;
    case DataType.Website:
      return WebsiteEditor;
    case DataType.Photo:
      return PhotoEditor;
    case DataType.Summary:
      return SummaryEditor;
    case DataType.Experience:
      return ExperienceEditor;
    case DataType.Education:
      return EducationEditor;
    case DataType.Certificate:
      return CertificateEditor;
    case DataType.Skill:
      return SkillEditor;
    case DataType.Language:
      return LanguageEditor;
    default:
      throw new Error(`No editor for '${type.value}'.`);
  }
});

const state = computed(function () {
  return data.value.state;
});

const parents = computed({ jobs }, function () {
  // wait for job data available
  const jobs = this.jobs.value;

  if (!(jobs instanceof Map)) {
    return undefined;
  }

  // get selected job
  const selectedJob = context.job;

  if (!selectedJob) {
    throw new Error('No job has been selected.');
  }

  // populate select items
  const locale = appLocale.value;
  const parents = data.value.parents;
  const result = new Array<{ text: string, value: number }>();

  for (let i = 0; i < parents.length; i++) {
    const parent = parents[i];
    let text;

    // locale name
    if (parent.locale) {
      text = getLanguageName(parent.locale, locale);
    } else {
      text = t('sample-data.label.invariant-locale');
    }

    // job name
    if (!parent.targetJob.equals(selectedJob)) {
      let job;

      if (parent.targetJob.isNil()) {
        job = t('sample-data.label.invariant-locale');
      } else {
        const data = jobs.get(parent.targetJob.toString());

        if (!data) {
          throw new Error(`Unknown job ${parent.targetJob}.`);
        }

        job = data.name;
      }

      text += ` | ${job}`;
    }

    result.push({ text, value: i });
  }

  return result;
});

const parent = computed(function () {
  const parent = state.value.parent as SampleData | null;

  if (!parent) {
    return null;
  }

  const index = data.value.parents.indexOf(parent);

  if (index === -1) {
    throw new Error('The selected parent is not exists in the list.');
  }

  return index;
});

// functions
const updateParent = function (v: number | null) {
  if (v === null) {
    emit('parent-change', null);
  } else {
    emit('parent-change', data.value.parents[v]);
  }
};
</script>
