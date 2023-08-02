<template>
  <b-form-group
    :label="$t('language-editor.label.ilr-label')"
    :description="$t('language-editor.message.ilr-description')"
    :state="value === null ? false : null"
    :invalid-feedback="$t('language-editor.message.ilr-no-selected')"
    label-for="ilr-scale">
    <b-form-select :state="value === null ? false : null" :options="scales" :value="value" id="ilr-scale" @change="$emit('input', $event)">
      <template #first>
        <b-form-select-option :value="null" disabled>{{ $t('language-editor.label.ilr-placeholder') }}</b-form-select-option>
      </template>
    </b-form-select>
  </b-form-group>
</template>

<script lang="ts">
import { BFormGroup, BFormSelect, BFormSelectOption } from 'bootstrap-vue';
import Vue from 'vue';
import { ILR } from '@/clients/resume-data';
import { State } from './models';

export default Vue.extend({
  components: { BFormGroup, BFormSelect, BFormSelectOption },
  props: {
    state: {
      type: State,
      required: true
    }
  },
  computed: {
    value: function (): ILR | null {
      return this.state.value as ILR | null;
    },
    scales: function (): ScaleItem[] {
      return [
        {
          text: this.$t('language-editor.label.ilr-no-proficiency') as string,
          value: ILR.NoProficiency
        },
        {
          text: this.$t('language-editor.label.ilr-elementary') as string,
          value: ILR.Elementary
        },
        {
          text: this.$t('language-editor.label.ilr-limited-working') as string,
          value: ILR.LimitedWorking
        },
        {
          text: this.$t('language-editor.label.ilr-professional-working') as string,
          value: ILR.ProfessionalWorking
        },
        {
          text: this.$t('language-editor.label.ilr-full-professional') as string,
          value: ILR.FullProfessional
        },
        {
          text: this.$t('language-editor.label.ilr-native') as string,
          value: ILR.Native
        }
      ];
    }
  }
});

interface ScaleItem {
  text: string;
  value: ILR | null;
}
</script>
