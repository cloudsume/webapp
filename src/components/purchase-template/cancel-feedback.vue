<template>
  <Modal :title="t('purchase-template.label.feedback-title')" :ok-disabled="reason === undefined" v3 @ok="ok" @hidden="emit('hidden')" v-slot="{}">
    <BFormSelect v-model="reason">
      <BFormSelectOption :value="undefined" disabled>{{ t('purchase-template.label.feedback-select') }}</BFormSelectOption>
      <BFormSelectOption :value="0">{{ t('purchase-template.label.too-expensive') }}</BFormSelectOption>
      <BFormSelectOption :value="1">{{ t('purchase-template.label.no-cards') }}</BFormSelectOption>
      <BFormSelectOption :value="3">{{ t('purchase-template.label.mistaken-free') }}</BFormSelectOption>
      <BFormSelectOption :value="4">{{ t('purchase-template.label.payment-not-working') }}</BFormSelectOption>
      <BFormSelectOption :value="2">{{ t('purchase-template.label.untrusted') }}</BFormSelectOption>
    </BFormSelect>
  </Modal>
</template>

<script setup lang="ts">
import { BFormSelect, BFormSelectOption } from 'bootstrap-vue';
import { ref, Ref } from 'vue';
import { ClientKey } from '@/clients/rest';
import { CancelPurchaseReason, TemplateRegistration, TemplateRegistrationService } from '@/clients/template-registration';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { useTranslation } from '@/i18n';
import { Alert } from '@/services';
import { Source } from '@/store';
import { bind } from '@/util/binder';
import { inject } from '@/util/injector';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  template: {
    type: TemplateRegistration,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// local states
const reason: Ref<CancelPurchaseReason | undefined> = ref(undefined);

// functions
const ok = bind({ reason }, async function (proceed: Proceed, busy: ToggleBusy) {
  const reason = this.reason.value;

  if (reason === undefined) {
    return;
  }

  busy(true);

  try {
    const ts = new TemplateRegistrationService(rest);
    await ts.writeCancelPurchaseFeedback(props.template.id, reason);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('purchase-template.message.cancel-feedback-error', { error }), error);
    busy(false);
    return;
  }

  proceed();
});
</script>
