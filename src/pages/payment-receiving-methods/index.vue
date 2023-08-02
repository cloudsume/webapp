<template>
  <page>
    <!-- setup expired -->
    <b-alert :show="isSetupExpired" variant="danger" dismissible>
      {{ $t('payment-provider-list.message.setup-expired', { method: setupExpiredMethod }) }}
    </b-alert>
    <!-- grid -->
    <card-deck :items="methods" :primary-key="getNodeKey" cols="12" lg="6">
      <!-- details -->
      <template #default="{ item }">
        <b-card>
          <!-- title -->
          <b-card-title>
            {{ getMethodName(item) }}
            <b-badge v-if="requiresSetup(item)" variant="warning">
              {{ $t('payment-provider-list.label.setup-required') }}
            </b-badge>
            <b-badge v-else-if="isProcessing(item)" variant="info">
              {{ $t('payment-provider-list.label.processing') }}
            </b-badge>
          </b-card-title>
          <!-- info -->
          <b-card-text>
            <!-- created at -->
            <div>
              <b-icon icon="box"></b-icon>
              {{ getCreatedTime(item) }}
            </div>
          </b-card-text>
          <!-- actions -->
          <b-overlay v-if="requiresSetup(item)" :show="isSettingUp(item)" class="d-inline-block" spinner-variant="primary" rounded spinner-small no-fade>
            <b-button :disabled="busy" variant="primary" @click="setup(item)">
              {{ $t('payment-provider-list.label.setup') }}
            </b-button>
          </b-overlay>
        </b-card>
      </template>
      <!-- new -->
      <template #footer="{}">
        <b-card :title="$t('payment-provider-list.label.new')">
          <!-- description -->
          <b-card-text>{{ $t('payment-provider-list.message.new-description') }}</b-card-text>
          <!-- create button -->
          <span id="create-method" class="d-inline-block">
            <BButton variant="primary" :disabled="!canCreate || busy" @click="selectMethod">
              {{ $t('payment-provider-list.label.create') }}
            </BButton>
          </span>
          <BTooltip v-if="isGuest" target="create-method">
            {{ $t('payment-receiving-methods.message.require-non-guest-account') }}
          </BTooltip>
          <BTooltip v-else-if="!emailVerified" target="create-method">
            {{ $t('payment-provider-list.message.require-email-confirmation') }}
          </BTooltip>
        </b-card>
      </template>
    </card-deck>
    <!-- modals -->
    <select-method v-if="selectingMethod" :current="selectingMethod" @input="methodSelected" @hidden="selectingMethod = null"></select-method>
    <create-stripe v-if="creatingStripe" @input="methodCreated" @hidden="creating = null"></create-stripe>
  </page>
</template>

<script lang="ts">
import { BAlert, BBadge, BButton, BCard, BCardText, BCardTitle, BIcon, BIconBox, BOverlay, BTooltip } from 'bootstrap-vue';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { PaymentProvider } from '@/clients/payment';
import { CAPTCHAError, PaymentReceivingMethod, PaymentReceivingMethodService, ReceivingMethodStatus } from '@/clients/payment-receiving-method';
import CardDeck from '@/components/card-deck';
import Page from '@/components/page';
import { getCaptchaKey } from '@/config';
import { Session } from '@/state/session';
import { Source } from '@/store';
import { Uuid } from '@/util/uuid';
import CreateStripe from './create-stripe.vue';
import { Context, ContextKey } from './models';
import SelectMethod from './select-method.vue';

export default Vue.extend({
  components: { BAlert, BBadge, BButton, BCard, BCardText, BCardTitle, BIcon, BIconBox, BOverlay, BTooltip, CardDeck, CreateStripe, Page, SelectMethod },
  props: {
    setupExpired: String
  },
  data: function () {
    return {
      context: new Context(),
      selectingMethod: null as Set<PaymentProvider> | null,
      creating: null as PaymentProvider | null,
      settingUp: null as Uuid | null
    };
  },
  computed: {
    session: function (): Session {
      return this.$store.state.session;
    },
    isSetupExpired: function (): boolean {
      return typeof this.setupExpired === 'string' && this.setupExpired.length > 0;
    },
    setupExpiredMethod: function (): TranslateResult {
      if (!this.setupExpired || !this.context.methods.length) {
        return '';
      }

      const id = new Uuid(this.setupExpired);
      const method = this.context.methods.find(m => m.id.equals(id));

      if (!method) {
        throw new Error(`Unknown method ${id} for expired setup link.`);
      }

      return this.getMethodName(method);
    },
    methods: function (): PaymentReceivingMethod[] {
      return [...this.context.methods].sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf()); // descending
    },
    canCreate: function (): boolean {
      return this.session.account?.profile.email_verified === true;
    },
    isGuest: function (): boolean {
      return this.session.isGuest;
    },
    emailVerified: function (): boolean {
      return this.session.account?.profile.email_verified === true;
    },
    creatingStripe: function (): boolean {
      return this.creating === PaymentProvider.Stripe;
    },
    busy: function (): boolean {
      return this.settingUp !== null;
    }
  },
  provide: function (): object {
    return {
      [ContextKey]: this.context
    };
  },
  fetch: async function () {
    const service = new PaymentReceivingMethodService(this.$rest);
    let methods: PaymentReceivingMethod[];

    try {
      methods = await service.list();
    } catch (e) {
      // TODO: display alert
      methods = [];
    }

    this.context.methods.push(...methods);
  },
  methods: {
    getNodeKey: function (m: PaymentReceivingMethod): string {
      return m.id.toString();
    },
    getMethodName: function (m: PaymentReceivingMethod): TranslateResult {
      switch (m.type) {
        case PaymentProvider.Stripe:
          return this.$t('payment-provider-list.label.stripe');
        default:
          throw new Error(`Unknown method ${m.type}.`);
      }
    },
    requiresSetup: function (m: PaymentReceivingMethod): boolean {
      return m.status >= ReceivingMethodStatus.SetupRequired && m.status < ReceivingMethodStatus.Processing;
    },
    isProcessing: function (m: PaymentReceivingMethod): boolean {
      return m.status >= ReceivingMethodStatus.Processing && m.status < ReceivingMethodStatus.ActionRequired;
    },
    getCreatedTime: function (m: PaymentReceivingMethod): string {
      return this.$d(m.createdAt, 'long');
    },
    isSettingUp: function (m: PaymentReceivingMethod): boolean {
      return this.settingUp !== null && this.settingUp.equals(m.id);
    },
    setup: async function (m: PaymentReceivingMethod): Promise<void> {
      const service = new PaymentReceivingMethodService(this.$rest);

      this.settingUp = m.id;

      // load captcha
      let captcha;

      try {
        captcha = await grecaptcha.execute(getCaptchaKey(), { action: 'payment_receiving_method_setup_uri' });
      } catch (e) {
        this.$error(Source.App, () => this.$t('payment-receiving-methods.message.captcha-error'), e as Error);
        this.settingUp = null;
        return;
      }

      // get setup uri
      let uri;

      try {
        uri = await service.getSetupUri(m.id, captcha, process.env.BASE_URI + this.$route.path);
      } catch (e) {
        if (e instanceof CAPTCHAError) {
          this.$error(Source.Server, () => this.$t('payment-receiving-methods.message.setup-captcha-error'), e);
        } else {
          this.$error(Source.Server, () => this.$t('payment-receiving-methods.message.setup-unknown-error', { error: (e as Error).message }), e as Error);
        }

        this.settingUp = null;
        return;
      }

      window.location.href = uri;
    },
    selectMethod: function (): void {
      this.selectingMethod = new Set(this.context.methods.map(m => m.type));
    },
    methodSelected: function (id: PaymentProvider): void {
      this.creating = id;
    },
    methodCreated: function (m: PaymentReceivingMethod): void {
      this.context.methods.push(m);
    }
  }
});
</script>
