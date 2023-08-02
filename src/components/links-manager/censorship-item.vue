<template>
  <BListGroupItem>
    <!-- header -->
    <div class="d-flex justify-content-between">
      <h5 class="mb-1 text-muted text-truncate">{{ title }}</h5>
      <BFormCheckbox :checked="props.data.selected" switch @change="emit('input', $event)"></BFormCheckbox>
    </div>
    <!-- data -->
    <PropertyViewer :key="index" :type="props.data.type" :field="props.data.prop" :value="data">
      <template #single-line="{ value }">
        <p v-if="value === null" class="mb-0 text-muted">{{ t('links-manager.label.data-disabled') }}</p>
        <p v-else class="mb-0">{{ value }}</p>
      </template>
    </PropertyViewer>
    <!-- left/right -->
    <div class="d-flex mt-1">
      <BButton :disabled="index === 0" size="sm" class="flex-grow-1 mr-1" @click="index--">
        <BIconChevronLeft></BIconChevronLeft>
      </BButton>
      <BButton :disabled="index === props.data.data.length - 1" size="sm" class="flex-grow-1 ml-1" @click="index++">
        <BIconChevronRight></BIconChevronRight>
      </BButton>
    </div>
  </BListGroupItem>
</template>

<script setup lang="ts">
import { BButton, BIconChevronLeft, BIconChevronRight, BListGroupItem, BFormCheckbox } from 'bootstrap-vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { getDataMetadata, getPropertyMetadata } from '@/components/data-editor';
import PropertyViewer from '@/components/property-viewer';
import { I18n } from '@/services';
import { inject } from '@/util/injector';
import { CensorshipItem } from './models';

const { t } = useI18n();

// props & emit
const props = defineProps({
  data: {
    type: CensorshipItem,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'input', v: boolean): void;
}>();

// app services
const i18n = inject(I18n);

// local states
const index = ref(0);

// computed
const title = computed(function () {
  const data = props.data;
  const type = getDataMetadata(data.type).label(i18n) as string;

  if (data.prop) {
    const prop = getPropertyMetadata(data.type, data.prop).label(i18n);

    return `${type} – ${prop}`;
  } else {
    return type;
  }
});

const data = computed(function () {
  return props.data.data[index.value];
});
</script>
