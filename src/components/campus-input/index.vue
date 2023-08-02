<template>
  <browse-input
    :title="$t('campus-browser.label.modal-title')"
    :button-id="buttonId"
    :value="text"
    :state="state"
    :disabled="disabled"
    :busy="detail.busy"
    body-class="pb-0"
    @input="$emit('input', $event)"
    @hidden="resetBrowsing">
    <!-- use scoped slot for performance reason -->
    <template #default="{}">
      <!-- area selector -->
      <b-row>
        <b-col>
          <division-selector :value="division" :disabled="busy" class="mb-2" @input="changeDivision"></division-selector>
        </b-col>
      </b-row>
      <!-- list -->
      <b-table
        :fields="columns"
        :items="campuses"
        :busy="busy"
        :empty-text="noCampuses"
        select-mode="single"
        show-empty
        selectable
        @row-selected="selectCampuses">
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle" small></b-spinner>
            <strong>{{ $t('campus-browser.message.fetching') }}</strong>
          </div>
        </template>
      </b-table>
    </template>
    <!-- modal actions -->
    <template #modal-footer="{ cancel, complete }">
      <b-button @click="cancel">
        {{ $t('campus-browser.label.modal-cancel') }}
      </b-button>
      <b-button :disabled="selected === null" variant="primary" @click="confirmSelection(complete)">
        {{ $t('campus-browser.label.modal-ok') }}
      </b-button>
    </template>
  </browse-input>
</template>

<script lang="ts">
import { BButton, BCol, BRow, BSpinner, BTable, BvTableFieldArray } from 'bootstrap-vue';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { EducationCampus } from '@/clients/rest';
import BrowseInput, { CompleteBrowsing } from '@/components/browse-input';
import DivisionSelector from '@/components/division-selector';
import { Module } from '@/config';
import { RemoteData } from '@/util/remote-data';
import { Uuid } from '@/util/uuid';

export default Vue.extend({
  components: { BButton, BCol, BRow, BrowseInput, BSpinner, BTable, DivisionSelector },
  props: {
    buttonId: String,
    disabled: Boolean,
    state: Boolean,
    value: Uuid
  },
  data: function () {
    const fetchDetail = async (id: Uuid) => await this.$rest.getEducationCampus(id.toString());
    const watchValue = () => this.value;
    const compareValue = (a: Uuid, b: Uuid) => a.equals(b);

    return {
      detail: new RemoteData(this, fetchDetail, watchValue, compareValue),
      division: '',
      campuses: new Array<EducationCampus>(),
      selected: null as EducationCampus | null,
      busy: false
    };
  },
  computed: {
    text: function (): string {
      return this.detail.value?.name ?? '';
    },
    columns: function (): BvTableFieldArray {
      return [
        {
          key: 'name',
          label: this.$t('campus-browser.label.campus-name') as string
        }
      ];
    },
    noCampuses: function (): TranslateResult {
      if (this.division) {
        return this.$t('campus-browser.message.no-campuses');
      } else {
        return this.$t('campus-browser.message.no-area-selected');
      }
    }
  },
  methods: {
    changeDivision: async function (v: string): Promise<void> {
      if (v === this.division) {
        return;
      }

      this.division = v;
      this.selected = null;

      if (v) {
        const locale = this.$store.state[Module.Settings].language;
        const collator = new Intl.Collator(locale);

        this.busy = true;

        try {
          this.campuses = await this.$rest.listEducationCampuses(v);
          this.campuses.sort((a, b) => collator.compare(a.name, b.name));
        } finally {
          this.busy = false;
        }
      } else {
        this.campuses = [];
      }
    },
    selectCampuses: function (items: EducationCampus[]): void {
      this.selected = items.length ? items[0] : null;
    },
    confirmSelection: function (complete: CompleteBrowsing): void {
      if (!this.selected) {
        throw new Error('No item is selected.');
      }

      this.detail.hint = {
        key: this.selected.id,
        value: this.selected
      };

      complete(this.selected.id);
    },
    resetBrowsing: function (): void {
      this.selected = null;
      this.campuses = [];
      this.division = '';
    }
  }
});
</script>
