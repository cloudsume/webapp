<template>
  <modal :title="title" body-class="pb-0" :ok-disabled="!valid" v3 @ok="ok" @hidden="$emit('hidden', $event)" v-slot="{ ok }">
    <b-form novalidate @submit.prevent="ok">
      <b-form-group
        :label="$t('account-templates.label.change-category-new-category')"
        :description="$t('account-templates.message.change-category-new-category')"
        :state="valueState"
        :invalid-feedback="valueFeedback"
        label-for="change-category-new">
        <b-form-select id="change-category-new" :state="valueState" :options="available" v-model="value">
          <template #first>
            <b-form-select-option :value="null" disabled>{{ $t('account-templates.label.category-placeholder') }}</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>
    </b-form>
  </modal>
</template>

<script lang="ts">
import { BForm, BFormGroup, BFormSelect, BFormSelectOption } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { TranslateResult } from 'vue-i18n';
import { ReceivingMethodStatus } from '@/clients/payment-receiving-method';
import { RegistrationCategory, TemplateRegistrationService } from '@/clients/template-registration';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { PageComponent } from './component';
import { Template } from './models';

export default (Vue as VueConstructor<PageComponent>).extend({
  components: { BForm, BFormGroup, BFormSelect, BFormSelectOption, Modal },
  mixins: [PageComponent],
  props: {
    template: {
      type: Template,
      required: true
    }
  },
  data: function () {
    return {
      value: null as RegistrationCategory.Free | RegistrationCategory.Paid | null
    };
  },
  computed: {
    title: function (): string {
      return this.template.name;
    },
    available: function (): Item[] {
      const items: Item[] = [
        {
          text: this.$t('account-templates.label.free-category'),
          value: RegistrationCategory.Free
        },
        {
          text: this.$t('account-templates.label.paid-category'),
          value: RegistrationCategory.Paid
        }
      ];

      return items.filter(i => i.value !== this.template.category);
    },
    valueError: function (): ValueError {
      switch (this.value) {
        case null:
          return ValueError.NoInput;
        case RegistrationCategory.Paid:
          if (this.context.payments.some(p => p.status >= ReceivingMethodStatus.Ready)) {
            return ValueError.None;
          } else {
            return ValueError.NoPayments;
          }
        default:
          return ValueError.None;
      }
    },
    valueState: function (): boolean | null {
      return this.valueError === ValueError.None ? null : false;
    },
    valueFeedback: function (): TranslateResult | null {
      switch (this.valueError) {
        case ValueError.NoInput:
          return this.$t('account-templates.message.change-category-new-category-no-selection');
        case ValueError.NoPayments:
          return this.$t('account-templates.message.change-category-new-category-no-payments');
        default:
          return null;
      }
    },
    valid: function (): boolean {
      return this.valueState === null;
    }
  },
  methods: {
    ok: async function (proceed: Proceed, busy: ToggleBusy): Promise<void> {
      let updatePrices: boolean;

      if (!this.valid) {
        return;
      }

      if (this.value === RegistrationCategory.Free || this.value === RegistrationCategory.Paid && this.template.prices.size) {
        const service = new TemplateRegistrationService(this.$rest);

        busy(true);

        try {
          await service.setCategory(this.template.id, this.value);
        } catch (e) {
          // TODO: display alert
          busy(false);
          return;
        }

        updatePrices = false;
        proceed();
      } else {
        updatePrices = true;
        proceed();
      }

      this.$emit('input', this.value, updatePrices);
    }
  }
});

interface Item {
  text: TranslateResult;
  value: RegistrationCategory.Free | RegistrationCategory.Paid;
}

const enum ValueError {
  None = 0,
  NoInput = 1,
  NoPayments = 2
}
</script>
