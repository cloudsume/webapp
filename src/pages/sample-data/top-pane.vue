<template>
  <BFormRow>
    <!-- job -->
    <BCol md="6" lg="8">
      <BFormSelect :options="jobItems || []" :disabled="!jobItems || props.hasUnsaved" :value="job" class="mb-2" @change="jobChanged">
        <template #first>
          <BFormSelectOption value="" disabled>
            {{ t('sample-data.label.job-placeholder') }}
          </BFormSelectOption>
        </template>
      </BFormSelect>
    </BCol>
    <!-- locale & discard -->
    <BCol md="6" lg="4">
      <div class="d-flex mb-2">
        <!-- locale -->
        <BFormSelect :options="locales" :disabled="props.hasUnsaved" :value="locale" class="mr-2" @change="emit('locale-change', $event)">
          <template #first>
            <BFormSelectOption :value="null" disabled>
              {{ t('sample-data.label.locale-placeholder') }}
            </BFormSelectOption>
          </template>
        </BFormSelect>
        <!-- discard -->
        <BButton :disabled="!props.hasUnsaved" variant="danger" @click="discard">
          {{ t('sample-data.label.discard-changes') }}
        </BButton>
      </div>
    </BCol>
  </BFormRow>
</template>

<script setup lang="ts">
import { BButton, BCol, BFormRow, BFormSelect, BFormSelectOption } from 'bootstrap-vue';
import { InjectionKey } from 'vue';
import { ContextKey } from '@/components/data-editor';
import { AllowedTemplateCultures } from '@/config';
import { useJobs } from '@/data/jobs';
import { getLanguageName, getParentLanguage, useTranslation } from '@/i18n';
import { Locale } from '@/state';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';
import { Uuid } from '@/util/uuid';
import { Context } from './models';

const jobs = useJobs();
const { t } = useTranslation();

// props & emit
const props = defineProps({
  hasUnsaved: Boolean
});

const emit = defineEmits<{
  (e: 'job-change', v: Uuid): void;
  (e: 'locale-change', v: string): void;
  (e: 'discard'): void;
}>();

// global states
const appLocale = inject(Locale);

// component states
const context = inject(ContextKey as InjectionKey<Context>);

// computed
const jobItems = computed(function () {
  // check if data available
  const data = jobs.value;

  if (!(data instanceof Map)) {
    return undefined;
  }

  // populate items
  const items = new Array<{ value: string, text: string }>();

  for (const [k, v] of data) {
    items.push({ value: k, text: v.name });
  }

  // sort & insert default
  const locale = appLocale.value;

  items.sort((a, b) => a.text.localeCompare(b.text, locale));
  items.unshift({
    value: '00000000-0000-0000-0000-000000000000',
    text: t('sample-data.label.default-job')
  });

  return items;
});

const job = computed(function () {
  return context.job?.toString() ?? '';
});

const locales = computed(function () {
  // get all available locales
  const tags = new Set<string>();
  let tag: string | null;

  for (tag of AllowedTemplateCultures) {
    tags.add(tag);

    for (tag = getParentLanguage(tag); tag !== null; tag = getParentLanguage(tag)) {
      tags.add(tag);
    }
  }

  // create select items
  const locale = appLocale.value;
  const items = new Array<{ value: string | null, text: string }>();

  for (const tag of tags) {
    if (tag) {
      items.push({ value: tag, text: getLanguageName(tag, locale) });
    }
  }

  // sort & insert invariant locale
  items.sort((a, b) => a.text.localeCompare(b.text, locale));
  items.unshift({
    value: '',
    text: t('sample-data.label.invariant-locale')
  });

  return items;
});

const locale = computed(function () {
  return context.locale;
});

// functions
const jobChanged = function (v: string) {
  emit('job-change', new Uuid(v));
};

const discard = function () {
  if (confirm(t('sample-data.message.discard-unsaved'))) {
    emit('discard');
  }
};
</script>
