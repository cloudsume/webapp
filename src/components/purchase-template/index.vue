<template>
  <div>
    <!-- primary modal -->
    <WizardModal
      :title="t('purchase-template.label.title')"
      body-class="pb-0"
      start="introduction"
      :start-data="resume"
      :navigator="navigate"
      :completor="purchase"
      @input="completed"
      @hidden="hidden">
      <!-- introduction -->
      <template #page(introduction)="{ data, ready, update }">
        <Introduction :resume="data" @ready="ready" @input="update">
          <slot></slot>
        </Introduction>
      </template>
      <template #next(introduction)="{ result, update, proceed }">
        <PriceSelector :registration="result ? result() : null" @input="update" @confirm="proceed"></PriceSelector>
      </template>
      <!-- stripe -->
      <template #page(stripe)="{ data, ready, update }">
        <StripeForm :info="data" :return-url="returnUrl" @ready="ready" @input="update"></StripeForm>
      </template>
      <template #back(stripe)="{}">
        <p class="flex-grow-1">
          <BIconLockFill></BIconLockFill> {{ t('purchase-template.message.secured-by') }}<img src="./stripe.svg" style="height: 38px">
        </p>
      </template>
      <!-- complete stripe -->
      <template #complete(stripe)="{ data, disabled, proceed }">
        <SubmitPurchase :currency="data.currency" :amount="data.amount" :disabled="disabled" @submit="proceed"></SubmitPurchase>
      </template>
    </WizardModal>
    <!-- additional modals -->
    <CancelFeedback v-if="showCancelFeedback" :template="showCancelFeedback" @hidden="emit('hidden')"></CancelFeedback>
  </div>
</template>

<script setup lang="ts">
import { BIconLockFill } from 'bootstrap-vue';
import { ref, Ref } from 'vue';
import { ClientKey } from '@/clients/rest';
import { ResumeInfo } from '@/clients/resume';
import { StripePayment, TemplateRegistration, TemplateRegistrationService } from '@/clients/template-registration';
import WizardModal, { History, Navigation } from '@/components/wizard-modal';
import { getCaptchaKey } from '@/config';
import { useTranslation } from '@/i18n';
import { Alert } from '@/services';
import { Source } from '@/store';
import { inject } from '@/util/injector';
import CancelFeedback from './cancel-feedback.vue';
import Introduction from './introduction.vue';
import { StripePaymentInfo } from './models';
import PriceSelector from './price-selector.vue';
import StripeForm from './stripe-form.vue';
import SubmitPurchase from './submit-purchase.vue';

const { t } = useTranslation();

// props & emit
defineProps({
  resume: {
    type: ResumeInfo,
    required: true
  },
  returnUrl: {
    type: String,
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
const showCancelFeedback: Ref<TemplateRegistration | undefined> = ref(undefined);

// functions
const navigate = async function (from: string, result: unknown, submit?: unknown) {
  if (from === 'introduction') {
    const registration = result as TemplateRegistration;
    const currency = submit as string;

    // load captcha
    let captcha;

    try {
      captcha = await grecaptcha.execute(getCaptchaKey(), { action: 'template_payment_method' });
    } catch (e) {
      const error = e as Error;
      alert.error(Source.App, () => t('purchase-template.message.captcha-error'), error);
      return null;
    }

    // get payment method
    const service = new TemplateRegistrationService(rest);
    let method;

    try {
      method = await service.getPaymentMethod(registration.id, currency, captcha);
    } catch (e) {
      // TODO: display alert
      return null;
    }

    if (method === null) {
      // TODO: display alert
      return null;
    }

    // determine provider
    if (method instanceof StripePayment) {
      return new Navigation('stripe', new StripePaymentInfo(currency, method.amount, method.clientSecret), 'stripe');
    } else {
      throw new Error(`Unknown payment method ${method.constructor.name}.`);
    }
  } else {
    throw new Error(`Unknown page ${from}.`);
  }
};

const purchase = async function (histories: History[], result: unknown) {
  const last = histories[histories.length - 1];

  if (last.page === 'stripe') {
    try {
      await result;
    } catch (e) {
      return undefined;
    }

    throw new Error('Stripe failed to redirect after payment completed.');
  } else {
    throw new Error(`Unknown current page ${last.page}.`);
  }
};

const completed = function (r: unknown) {
  throw new Error('This error should never happen.');
};

const hidden = function (page: string, histories: History[]) {
  if (page === 'stripe') {
    // when this event is raised while we are in stripe page that mean the user cancel the purchase
    const intro = histories.find(h => h.page === 'introduction');

    if (!intro) {
      throw new Error('No introduction page in the history.');
    }

    showCancelFeedback.value = intro.result as TemplateRegistration;
  } else {
    emit('hidden');
  }
};
</script>
