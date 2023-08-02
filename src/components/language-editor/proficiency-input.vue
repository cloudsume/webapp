<template>
  <browse-input
    :title="$t('language-editor.label.proficiency-modal-title')"
    :button-id="buttonId"
    :value="text"
    :state="state"
    :disabled="disabled"
    body-class="pb-0"
    icon="pencil"
    @show="setupModal"
    @input="$emit('input', $event)"
    @hidden="resetModal">
    <template #default="{}">
      <!-- scale type -->
      <b-form-group
        :label="$t('language-editor.label.proficiency-type-label')"
        :description="$t('language-editor.message.proficiency-type-description')"
        :invalid-feedback="$t('language-editor.message.proficiency-type-no-selected')"
        :state="type === null ? false : null"
        label-for="language-proficiency-type">
        <b-form-select :options="types" :value="type" id="language-proficiency-type" @change="updateType">
          <template #first>
            <b-form-select-option :value="null" disabled>{{ $t('language-editor.label.proficiency-type-placeholder') }}</b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>
      <!-- scale value -->
      <ilr-input v-if="isILR" :state="data" @input="updateValue"></ilr-input>
      <toeic-input v-else-if="isTOEIC" :state="data" @input="updateValue"></toeic-input>
      <ielts-input v-else-if="isIELTS" :state="data" @input="updateValue"></ielts-input>
      <toefl-input v-else-if="isTOEFL" :state="data" @input="updateValue"></toefl-input>
    </template>
    <!-- modal actions -->
    <template #modal-footer="{ cancel, complete }">
      <b-button @click="cancel">
        {{ $t('language-editor.label.edit-cancel') }}
      </b-button>
      <b-button :disabled="!valid" variant="primary" @click="confirm(complete)">
        {{ $t('language-editor.label.edit-ok') }}
      </b-button>
    </template>
  </browse-input>
</template>

<script lang="ts">
import { BButton, BFormGroup, BFormSelect, BFormSelectOption, BIconPencil } from 'bootstrap-vue';
import Vue from 'vue';
import { IELTS, ILR, LanguageProficiency, LanguageProficiencyType } from '@/clients/resume-data';
import BrowseInput, { CompleteBrowsing } from '@/components/browse-input';
import { formatLanguageProficiency } from '@/resume-data';
import IeltsInput from './ielts-input.vue';
import IlrInput from './ilr-input.vue';
import { State } from './models';
import ToeicInput from './toeic-input.vue';
import ToeflInput from './toefl-input.vue';

export default Vue.extend({
  components: { BButton, BFormGroup, BFormSelect, BFormSelectOption, BIconPencil, BrowseInput, IeltsInput, IlrInput, ToeicInput, ToeflInput },
  props: {
    buttonId: String,
    disabled: Boolean,
    state: Boolean,
    value: LanguageProficiency
  },
  data: function () {
    return {
      data: new State()
    };
  },
  computed: {
    text: function (): string {
      return this.value ? formatLanguageProficiency(this.$i18n, this.value) : '';
    },
    type: function (): LanguageProficiencyType | null {
      return this.data.type;
    },
    types: function (): TypeItem[] {
      const locale = this.$store.state.locale;
      const types: TypeItem[] = [
        {
          text: this.$t('ilr-scale.label.header') as string,
          value: LanguageProficiencyType.ILR
        },
        {
          text: this.$t('toeic.label.select-item') as string,
          value: LanguageProficiencyType.TOEIC
        },
        {
          text: this.$t('ielts.label.select-item') as string,
          value: LanguageProficiencyType.IELTS
        },
        {
          text: this.$t('toefl.label.select-item') as string,
          value: LanguageProficiencyType.TOEFL
        }
      ];

      return types.sort((a, b) => a.text.localeCompare(b.text, locale));
    },
    isILR: function (): boolean {
      return this.type === LanguageProficiencyType.ILR;
    },
    isTOEIC: function (): boolean {
      return this.type === LanguageProficiencyType.TOEIC;
    },
    isIELTS: function (): boolean {
      return this.type === LanguageProficiencyType.IELTS;
    },
    isTOEFL: function (): boolean {
      return this.type === LanguageProficiencyType.TOEFL;
    },
    valid: function (): boolean {
      return this.data.type !== null && this.data.value !== null;
    }
  },
  methods: {
    setupModal: function (): void {
      if (this.value) {
        this.data.load(this.value);
      }
    },
    updateType: function (v: LanguageProficiencyType): void {
      this.data.updateType(v);
    },
    updateValue: function (v: ILR | number | IELTS | null): void {
      this.data.updateValue(v);
    },
    confirm: function (complete: CompleteBrowsing): void {
      const { type, value } = this.data;

      if (type === null || value === null) {
        throw new Error('The data is not ready.');
      }

      complete(new LanguageProficiency(type, value));
    },
    resetModal: function (): void {
      this.data.reset();
    }
  }
});

interface TypeItem {
  text: string;
  value: LanguageProficiencyType | null;
}
</script>
