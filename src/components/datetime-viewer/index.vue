<template>
  <span v-if="display">
    {{ display }}
  </span>
  <span v-else>
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { onUnmounted, ref, Ref, watch } from 'vue';
import { useTranslation } from '@/i18n';
import { computed } from '@/util/computed';

const { t, d } = useTranslation();

// props & emit
const props = defineProps({
  value: Date,
});

// local states
const elapsed: Ref<number | undefined> = ref(undefined);
const steps = [
  {
    threshold: 30,
    formatter: () => t('datetime-viewer.label.now')
  },
  {
    threshold: 90,
    formatter: () => t('datetime-viewer.label.one-minute')
  },
  {
    threshold: 3570,
    formatter: (v: number) => t('datetime-viewer.label.minutes', { minutes: Math.round(v / 60) })
  },
  {
    threshold: 5400,
    formatter: () => t('datetime-viewer.label.one-hour')
  },
  {
    threshold: 84600,
    formatter: (v: number) => t('datetime-viewer.label.hours', { hours: Math.round(v / 3600) })
  },
  {
    threshold: 129600,
    formatter: () => t('datetime-viewer.label.one-day')
  },
  {
    threshold: 561600,
    formatter: (v: number) => t('datetime-viewer.label.days', { days: Math.round(v / 86400) })
  }
];

let timer: number | undefined;

// computed
const display = computed(function () {
  const v = elapsed.value;

  if (v === undefined) {
    return '';
  }

  for (const s of steps) {
    if (v <= s.threshold) {
      return s.formatter(v);
    }
  }

  if (!props.value) {
    throw new Error('Value prop should not undefined.');
  }

  return d(props.value, 'short');
});

// functions
const update = function (value: Date) {
  const diff = Math.floor((Date.now() - value.getTime()) / 1000);
  let next: number | undefined;

  for (const s of steps) {
    if (diff <= s.threshold) {
      next = s.threshold + 1;
      break;
    }
  }

  elapsed.value = diff;

  if (next !== undefined) {
    timer = setTimeout(update, next * 1000, value);
  } else {
    timer = undefined;
  }
};

// watches
watch(() => props.value, function (v) {
  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }

  if (v) {
    update(v);
  } else {
    elapsed.value = undefined;
  }
}, { immediate: true });

// lifecycle hooks
onUnmounted(function () {
  if (timer !== undefined) {
    clearTimeout(timer);
  }
});
</script>
