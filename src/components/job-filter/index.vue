<template>
  <BOverlay :show="!loaded" no-fade spinner-small>
    <BFormSelect :options="items" :value="value ? value.toString() : null" :disabled="!loaded || props.disabled" @change="change">
      <template #first>
        <BFormSelectOption :value="null">{{ t('job-filter.label.any-job') }}</BFormSelectOption>
      </template>
    </BFormSelect>
  </BOverlay>
</template>

<script setup lang="ts">
import { BFormSelect, BFormSelectOption, BOverlay } from 'bootstrap-vue';
import { computed, onMounted, ref, Ref } from 'vue';
import { ClientKey } from '@/clients/rest';
import { useTranslation } from '@/i18n';
import { Job, JobEndpoint } from '@/rest-endpoints/job';
import { Alert } from '@/services';
import { Locale } from '@/state';
import { Source } from '@/store';
import { inject } from '@/util/injector';
import { Uuid } from '@/util/uuid';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  disabled: Boolean,
  filter: Function,
  value: Uuid
});

const emit = defineEmits<{
  (e: 'input', v: Uuid | undefined): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// global states
const locale = inject(Locale);

// local states
const loaded = ref(false);
const jobs: Ref<Job[]> = ref([]);

// computed
const items = computed(function () {
  const items = new Array<{ text: string, value: string }>;

  for (const j of jobs.value) {
    if (props.filter && !props.filter(j)) {
      continue;
    }

    items.push({ text: j.name, value: j.id.toString() });
  }

  return items;
});

// functions
const change = function (v: string | null) {
  emit('input', v === null ? undefined : new Uuid(v));
};

// lifecycle hooks
onMounted(async function () {
  emit('input', undefined);

  // load jobs
  const ep = new JobEndpoint(rest);

  try {
    jobs.value = await ep.list();
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('job-filter.message.jobs-load-error', { error }), error);
    return;
  } finally {
    loaded.value = true;
  }

  // sort
  const collator = new Intl.Collator(locale.value);

  jobs.value.sort((a, b) => collator.compare(a.name, b.name));
});
</script>
