<template>
  <Modal
    :title="t('resume-list.label.transfer-title')"
    :ok-title="t('resume-list.label.transfer-confirm')"
    body-class="pb-0"
    v3
    @ok="ok"
    @hidden="hidden">
    <p>{{ t('resume-list.message.transfer-info') }}</p>
  </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n-composable';
import { ClientKey } from '@/clients/rest';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { StorageKey } from '@/config';
import { GuestSessionEndpoint } from '@/rest-endpoints/guest-session';
import { Alert } from '@/services';
import { Session } from '@/state';
import { Source } from '@/store';
import { inject } from '@/util/injector';

const { t } = useI18n();

// props & emit
const emit = defineEmits<{
  (e: 'hidden', s: 'cancel' | 'conflict'): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// global states
const session = inject(Session);

// functions
const ok = async function (proceed: Proceed, busy: ToggleBusy) {
  const ep = new GuestSessionEndpoint(rest);
  const guest = session.value?.guest;

  if (!guest) {
    throw new Error('No guest session available.');
  }

  // do transfer
  let success;

  busy(true);

  try {
    success = await ep.delete(guest.id, guest.accessToken);
  } catch (e) {
    alert.error(Source.Server, () => t('resume-list.message.transfer-error', { account: guest.id }), e as Error);
    busy(false);
    return;
  }

  if (!success) {
    proceed('conflict');
    return;
  }

  // clear guest session and reload
  localStorage.removeItem(StorageKey.GuestToken);
  window.location.reload();
};

const hidden = function (result: unknown) {
  emit('hidden', result === 'conflict' ? 'conflict' : 'cancel');
};
</script>
