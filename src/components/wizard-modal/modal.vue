<template>
  <Modal
    v-bind="$attrs"
    v-bind:hide-header-close="hideCancel"
    v-bind:no-close-on-backdrop="hideCancel"
    v-bind:no-close-on-esc="hideCancel"
    v-on="{ ...$listeners, hidden }"
    footer-class="justify-content-between"
    initial-busy
    v3>
    <!-- body -->
    <template #default="p">
      <slot v-bind:name="`page(${page})`" v-bind="p" v-bind:data="data" v-bind:ready="() => p.busy(false)" v-bind:update="setResult"></slot>
    </template>
    <!-- navigation -->
    <template #modal-footer="{ ok, cancel, busy }">
      <!-- previous -->
      <BButton v-if="page === start" variant="link" :class="hideCancel ? 'p-0 invisible' : 'p-0'" @click="cancel">
        {{ t('wizard-modal.label.cancel-button') }}
      </BButton>
      <slot v-else :name="`back(${page})`" :navigate="() => previous(busy)">
        <BButton @click="previous(busy)">
          <BIconChevronLeft></BIconChevronLeft>
        </BButton>
      </slot>
      <!-- next -->
      <slot v-if="complete === null" :name="`next(${page})`" :result="result" :update="setSubmit" :proceed="() => next(ok, busy)">
        <BButton variant="primary" :disabled="result === null" @click="next(ok, busy)">
          <BIconChevronRight></BIconChevronRight>
        </BButton>
      </slot>
      <slot v-else :name="`complete(${complete})`" :disabled="result === null" :data="data" :proceed="() => next(ok, busy)"></slot>
    </template>
  </Modal>
</template>

<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { BButton, BIconChevronLeft, BIconChevronRight } from 'bootstrap-vue';
import { ref, Ref, watch } from 'vue';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { useTranslation } from '@/i18n';
import { History, Navigation, ResultFactory } from './models';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  hideCancel: Boolean,
  start: {
    type: String,
    required: true
  },
  startData: {
  },
  navigator: {
    type: Function,
    required: true
  },
  completor: {
    type: Function,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'change', p: string): void;
  (e: 'input', v: unknown): void;
  (e: 'hidden', p: string, h: History[]): void;
}>();

// local states
const page = ref(props.start);
const data = ref(props.startData);
const result: Ref<ResultFactory | null> = ref(null);
const submit: Ref<ResultFactory | null> = ref(null);
const complete: Ref<string | null> = ref(null);
const histories = new Array<History>();

// functions
const setResult = function (v: ResultFactory | null) {
  result.value = v;
};

const setSubmit = function (v: ResultFactory | null) {
  submit.value = v;
};

const previous = function (busy: ToggleBusy) {
  const prev = histories.pop();

  if (!prev) {
    throw new Error('No previous page to navigate back.');
  }

  page.value = prev.page;
  data.value = prev.data;
  result.value = null;
  submit.value = null;
  complete.value = null;

  busy(true);
};

const next = async function (ok: Proceed, busy: ToggleBusy) {
  if (!result.value) {
    throw new Error('No result factory to execute.');
  }

  busy(true);

  // get result and push history
  const r = result.value();
  const s = submit.value?.call(undefined);

  histories.push(new History(page.value, data.value, r));

  if (complete.value === null) {
    // execute navigator
    const n = await props.navigator(page.value, r, s) as Navigation;

    if (!n) {
      histories.pop();
      busy(false);
      return;
    }

    page.value = n.next;
    data.value = n.data;
    result.value = null;

    if (n.complete !== undefined) {
      complete.value = n.complete;
    }
  } else {
    // execute completor
    const final = await props.completor(histories, r);

    if (final === undefined) {
      histories.pop();
      busy(false);
    } else {
      emit('input', final);
      ok();
    }
  }
};

const hidden = function () {
  emit('hidden', page.value, histories);
};

// watches
watch(page, v => emit('change', v), { immediate: true });
</script>
