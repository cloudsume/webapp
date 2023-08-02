<template>
  <BListGroupItem :active="isActive" class="d-flex align-items-center">
    <!-- type label -->
    <div class="flex-grow-1">
      <BButton v-if="hasData && !isActive" :disabled="disabled" variant="link" class="p-0" @click="emit('click')">
        {{ label }}
      </BButton>
      <template v-else>
        {{ label }}
      </template>
    </div>
    <!-- indicator -->
    <BIconExclamationTriangleFill v-if="hasError" variant="warning" class="mr-2"></BIconExclamationTriangleFill>
    <!-- up -->
    <BButton v-if="hasData && isMultiplicable" :disabled="disabled || !props.canUp" size="sm" variant="dark" class="mr-1" @click="emit('up')">
      <BIconChevronUp></BIconChevronUp>
    </BButton>
    <!-- down -->
    <BButton v-if="hasData && isMultiplicable" :disabled="disabled || !props.canDown" size="sm" variant="dark" class="mr-1" @click="emit('down')">
      <BIconChevronDown></BIconChevronDown>
    </BButton>
    <!-- trash -->
    <BButton v-if="hasData" :disabled="disabled" key="del-btn" size="sm" variant="danger" @click="emit('delete')">
      <BIconTrash></BIconTrash>
    </BButton>
    <!-- add -->
    <BButton v-else :disabled="disabled" key="add-btn" size="sm" @click="emit('add')">
      <BIconPlus></BIconPlus>
    </BButton>
  </BListGroupItem>
</template>

<script setup lang="ts">
import { BButton, BIconChevronDown, BIconChevronUp, BIconExclamationTriangleFill, BIconPlus, BIconTrash, BListGroupItem } from 'bootstrap-vue';
import { computed, InjectionKey } from 'vue';
import { ContextKey, DataFlags, maxEntries } from '@/components/data-editor';
import { inject } from '@/util/injector';
import { Context, Item } from './models';

// props & emit
const props = defineProps({
  item: {
    type: Item,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  canUp: Boolean,
  canDown: Boolean
});

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'click'): void;
  (e: 'delete'): void;
  (e: 'up'): void;
  (e: 'down'): void;
}>();

// component states
const context = inject(ContextKey as InjectionKey<Context>);

// computed
const disabled = computed(function () {
  return !context.job || context.locale === null || context.saving;
});

const isMultiplicable = computed(function () {
  return maxEntries(props.item.type) > 1;
});

const hasData = computed(function () {
  return props.item.data !== null;
});

const isActive = computed(function () {
  return props.item.id === context.item;
});

const hasError = computed(function () {
  const data = props.item.data;

  if (!data) {
    return false;
  }

  return (data.state.flags & DataFlags.Error) !== 0;
});
</script>
