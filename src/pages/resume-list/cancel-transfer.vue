<template>
  <Modal
    :title="t('resume-list.label.cancel-transfer-title')"
    :ok-title="t('resume-list.label.cancel-transfer-confirm')"
    ok-variant="danger"
    body-class="pb-0"
    ok-only
    v3
    @ok="ok"
    @hidden="emit('hidden')">
    <p>{{ t('resume-list.message.cancel-transfer-warning') }}</p>
  </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n-composable';
import Modal from '@/components/modal';
import { StorageKey } from '@/config';

const { t } = useI18n();

// props & emit
const emit = defineEmits<{
  (e: 'hidden'): void;
}>();

// functions
const ok = function () {
  localStorage.removeItem(StorageKey.GuestToken);
  window.location.reload(); // force refresh session
};
</script>
