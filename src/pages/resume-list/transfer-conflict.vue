<template>
  <Modal
    :title="t('resume-list.label.transfer-conflict')"
    :ok-title="t('resume-list.label.transfer-signout')"
    body-class="pb-0"
    v3
    @ok="ok"
    @hidden="emit('hidden')">
    <p>{{ t('resume-list.message.transfer-conflict')}} </p>
  </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n-composable';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { Alert, IDP } from '@/services';
import { Source } from '@/store';
import { inject } from '@/util/injector';

const { t } = useI18n();

// props & emit
const emit = defineEmits<{
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);
const idp = inject(IDP);

// functions
const ok = async function (proceed: Proceed, busy: ToggleBusy) {
  busy(true);

  try {
    await idp.signoutRedirect();
  } catch (e) {
    alert.error(Source.App, () => t('sign-out.message.error'), e as Error);
    busy(false);
  }
};
</script>
