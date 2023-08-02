<template>
  <Modal :title="t('payment-provider-list.label.new-title')" body-class="pb-0" hide-footer v3 @hidden="hidden" v-slot="{ ok }">
    <CardDeck :items="available" primary-key="id" cols="12" v-slot="{ item }">
      <BCard class="overflow-hidden" no-body>
        <BRow no-gutters>
          <!-- logo -->
          <BCol cols="3" class="d-flex">
            <BCardImg :src="item.logo" :alt="item.name" class="rounded-0"></BCardImg>
          </BCol>
          <!-- details -->
          <BCol cols="9">
            <BCardBody :title="item.name">
              <BCardText>
                <!-- website -->
                <div>
                  <BIconHouseDoor></BIconHouseDoor>
                  <a :href="item.website" target="_blank">{{ item.website }}</a>
                </div>
              </BCardText>
              <!-- create button -->
              <BButton variant="primary" block @click="ok(item.id)">
                {{ t('payment-provider-list.label.new-select-button') }}
              </BButton>
            </BCardBody>
          </BCol>
        </BRow>
      </BCard>
    </CardDeck>
  </Modal>
</template>

<script setup lang="ts">
import { BButton, BCard, BCardBody, BCardImg, BCardText, BCol, BIconHouseDoor, BRow } from 'bootstrap-vue';
import { PaymentProvider } from '@/clients/payment';
import CardDeck from '@/components/card-deck';
import Modal from '@/components/modal';
import { useTranslation } from '@/i18n';
import { computed } from '@/util/computed';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  current: {
    type: Set<PaymentProvider>,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'input', v: PaymentProvider): void;
  (e: 'hidden'): void;
}>();

// computed
const available = computed(function () {
  const all = [
    {
      id: PaymentProvider.Stripe,
      logo: require('./stripe.svg'),
      name: t('payment-provider-list.label.stripe'),
      website: 'https://stripe.com'
    }
  ];

  return all.filter(p => !props.current.has(p.id));
});

// functions
const hidden = function (result: unknown) {
  if (typeof result === 'number') {
    emit('input', result);
  }

  emit('hidden');
};
</script>
