<template>
  <modal :title="title" :context="template" body-class="position-static pb-0" v2 @change="$emit('change', $event)" @show="populate" @hide="hiding">
    <!-- price list -->
    <template #default="{}">
      <b-form novalidate @submit="submit">
        <!-- list -->
        <b-form-row v-for="p of prices" :key="p.id" class="mb-2">
          <!-- currency -->
          <b-col cols="6" md="5">
            <currency-selector :state="p.currencyState" :filter="c => c === p.currency || !hasCurrency(c)" v-model="p.currency"></currency-selector>
          </b-col>
          <!-- price -->
          <b-col cols="6" md="7" class="d-flex">
            <money-input :placeholder="$t('account-templates.label.price-placeholder')" :state="p.priceState" :currency="p.currency" v-model="p.price">
            </money-input>
            <b-button variant="danger" style="margin-left: 10px" @click="remove(p.id)">
              <b-icon icon="trash"></b-icon>
            </b-button>
          </b-col>
        </b-form-row>
        <!-- new -->
        <b-button :disabled="!canAdd" variant="outline-secondary" size="sm" class="mb-2" block @click="add">
          <b-icon icon="plus"></b-icon>
        </b-button>
        <!-- infomation -->
        <p class="text-muted">
          <i18n tag="small" path="account-templates.message.terms-summary">
            <template #fee>
              <strong>20%</strong>
            </template>
          </i18n>
        </p>
      </b-form>
    </template>
    <!-- loading -->
    <template #post-body="{}">
      <b-overlay :show="busy" no-wrap rounded no-fade></b-overlay>
    </template>
    <!-- footer -->
    <template #modal-footer="{ cancel }">
      <b-button :disabled="busy" @click="cancel">{{ $t('account-templates.label.price-cancel') }}</b-button>
      <b-button :disabled="busy || !canSave" variant="primary" @click="save">{{ $t('account-templates.label.price-save') }}</b-button>
    </template>
  </modal>
</template>

<script lang="ts">
import { BButton, BCol, BForm, BFormRow, BIcon, BIconPlus, BIconTrash, BOverlay, BvModalEvent } from 'bootstrap-vue';
import Vue from 'vue';
import { TemplateRegistrationService } from '@/clients/template-registration';
import CurrencySelector, { Available as AvailableCurrencies } from '@/components/currency-selector';
import Modal from '@/components/modal';
import MoneyInput from '@/components/money-input';
import { InputResult } from '@/util/input-result';
import { Template } from './models';

export default Vue.extend({
  components: { BButton, BCol, BForm, BFormRow, BIcon, BIconPlus, BIconTrash, BOverlay, CurrencySelector, Modal, MoneyInput },
  model: {
    prop: 'template',
    event: 'change'
  },
  props: {
    template: Template
  },
  data: function () {
    return {
      title: '',
      prices: new Array<Price>(),
      busy: false,
      updated: false
    };
  },
  computed: {
    canAdd: function (): boolean {
      if (!this.prices.length) {
        return true;
      } else if (!this.prices[this.prices.length - 1].currency) {
        return false;
      } else if (this.prices.length === AvailableCurrencies.length) {
        return false; // we don't need to check for existence due to we already forced unique currencies
      }

      return true;
    },
    canSave: function (): boolean {
      return this.prices.length > 0 && this.prices.every(p => p.valid);
    }
  },
  methods: {
    populate: function (): void {
      const prices = new Array<Price>();

      for (const [c, p] of this.template.prices) {
        prices.push(new Price(c, new InputResult(p.toString(), true)));
      }

      // trigger reactivity
      this.title = this.template.name;
      this.prices = prices.sort((a, b) => a.currency.localeCompare(b.currency, 'en'));
      this.busy = false;
      this.updated = false;
    },
    remove: function (id: number): void {
      const i = this.prices.findIndex(p => p.id === id);

      if (i === -1) {
        throw new Error(`Unknown price with ID ${id}.`);
      }

      this.prices.splice(i, 1);
    },
    add: function (): void {
      this.prices.push(new Price('', new InputResult('', false)));
    },
    hasCurrency: function (v: string): boolean {
      return this.prices.some(p => p.currency === v);
    },
    submit: function (e: Event): void {
      e.preventDefault();

      if (!this.busy && this.canSave) {
        this.save();
      }
    },
    save: async function (): Promise<void> {
      const service = new TemplateRegistrationService(this.$rest);
      const prices = new Map<string, number>();

      for (const p of this.prices) {
        prices.set(p.currency, parseFloat(p.price.value));
      }

      this.busy = true;

      try {
        await service.setPrices(this.template.id, prices);
      } catch (e) {
        // TODO: display alert
        this.busy = false;
        return;
      }

      if (this.template.pendingCategory !== null) {
        try {
          await service.setCategory(this.template.id, this.template.pendingCategory);
        } catch (e) {
          // TODO: display alert
          this.busy = false;
          return;
        }
      }

      this.updated = true;
      this.$emit('input', prices);
      this.$emit('change', null);
    },
    hiding: function (e: BvModalEvent): void {
      if (this.busy && !this.updated) {
        e.preventDefault();
      }
    }
  }
});

let nextId = 0;

class Price {
  id: number;
  currency: string;
  price: InputResult<string>;

  constructor(currency: string, price: InputResult<string>) {
    this.id = nextId++;
    this.currency = currency;
    this.price = price;
  }

  get currencyState(): boolean | null {
    return this.currency ? null : false;
  }

  get priceState(): boolean | null {
    if (!this.price.valid) {
      return false;
    }

    const v = parseFloat(this.price.value);
    const r = checkPrice(this.currency, v);

    return r ? null : false;
  }

  get valid(): boolean {
    return this.currencyState === null && this.priceState === null;
  }
}

function checkPrice(c: string, v: number): boolean {
  switch (c) {
    case 'USD':
      return v >= 3 && v <= 100;
    default:
      return false;
  }
}
</script>
