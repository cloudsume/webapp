<template>
  <!-- fallback on default -->
  <span v-if="value === null && !lang" class="text-muted">
    {{ t('global-editor.label.disabled-field') }}
  </span>
  <!-- fallback on non-default -->
  <i18n v-else-if="value === null" path="global-editor.label.fallback-photo" class="text-muted">
    <template #lang>{{ parentName }}</template>
  </i18n>
  <!-- disabled on this layer -->
  <span v-else-if="value.value === null" class="text-muted">
    {{ t('global-editor.label.disabled-field') }}
  </span>
  <!-- value on this layer -->
  <PropertyViewer v-else :type="type" :field="simple ? null : property" :value="value.value">
    <template #single-line="{ value }">{{ value }}</template>
  </PropertyViewer>
</template>

<script setup lang="ts">
import { DataProperty } from '@/clients/resume-data';
import { DataMerger } from '@/components/parent-selector';
import PropertyViewer from '@/components/property-viewer';
import { getLanguageName, getParentLanguage, useTranslation } from '@/i18n';
import { Locale } from '@/state';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';
import { SimpleData } from './models';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  type: {
    type: String,
    required: true
  },
  object: {
    type: Object,
    required: true
  },
  property: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    required: true
  }
});

// app states
const locale = inject(Locale);

// computed
const simple = computed(function (): boolean {
  return props.object instanceof SimpleData;
});

const data = computed(function (): DataProperty<unknown> {
  return props.object[props.property];
});

const parentName = computed(function () {
  const id = getParentLanguage(props.lang);

  if (id === null) {
    return null;
  } else if (id) {
    return getLanguageName(id, locale.value);
  } else {
    return t('global-editor.label.default-language');
  }
});

const value = computed(function (): { value: unknown | null, lang: string | null } | null {
  const p = getParentLanguage(props.lang);
  const r = (v: unknown, l: string | null) => ({ value: v, lang: l});

  if (simple.value) {
    return new DataMerger(data.value, p, undefined).for(d => d, r);
  } else {
    return new DataMerger(props.object, p, undefined).for(d => (d as any)[props.property], r);
  }
});
</script>
