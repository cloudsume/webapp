<template>
  <Modal
    :title="t('payment-provider-list.label.new-stripe-title')"
    body-class="pb-0"
    :ok-disabled="isError"
    v3
    @ok="create"
    @hidden="emit('hidden')"
    v-slot="{ ok }">
    <BForm novalidate @submit.prevent="ok">
      <BFormGroup
        :label="t('payment-provider-list.label.new-stripe-country')"
        :state="countryState"
        :invalid-feedback="t('payment-provider-list.message.new-stripe-no-country')"
        label-for="stripe-country">
        <CountrySelector id="stripe-country" :state="countryState" :filter="isCountryAllowed" v-model="country"></CountrySelector>
        <template #description>
          {{ t('payment-provider-list.message.new-stripe-country') }}
          <strong>{{ t('payment-receiving-methods.message.stripe-country-warning') }}</strong>
        </template>
      </BFormGroup>
    </BForm>
  </Modal>
</template>

<script setup lang="ts">
import { BForm, BFormGroup } from 'bootstrap-vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { CreateStripeReceivingMethod, PaymentReceivingMethod, PaymentReceivingMethodService } from '@/clients/payment-receiving-method';
import { ClientKey } from '@/clients/rest';
import CountrySelector from '@/components/country-selector';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { inject } from '@/util/injector';

const { t } = useI18n();

// props & emits
const emit = defineEmits<{
  (e: 'hidden'): void;
  (e: 'input', m: PaymentReceivingMethod): void;
}>();

// app services
const rest = inject(ClientKey);

// local states
const country = ref('');

// computed
const countryState = computed(function () {
  return country.value ? null : false;
});

const isError = computed(function () {
  return countryState.value === false;
});

// functions
const create = async function (proceed: Proceed, busy: ToggleBusy) {
  if (isError.value) {
    return;
  }

  const service = new PaymentReceivingMethodService(rest);
  const request = new CreateStripeReceivingMethod(country.value);
  let method;

  busy(true);

  try {
    method = await service.create(request);
  } catch (e) {
    // TODO: display alert
    busy(false);
    return;
  }

  emit('input', method);
  proceed();
}

const isCountryAllowed = function (id: string) {
  return id === 'EE' || id === 'NG' || id === 'SG' || id === 'TH' || id === 'US';
};
</script>
