<template>
  <div>
    <!-- module -->
    <b-form-group
      :label="$t('language-editor.label.ielts-module-label')"
      :description="$t('language-editor.message.ielts-modula-description')"
      :state="type === null ? false : null"
      :invalid-feedback="$t('language-editor.message.ielts-module-no-selected')"
      label-for="ielts-module">
      <b-form-select id="ielts-module" :state="type === null ? false : null" :options="types" :value="type" @change="updateType">
        <template #first>
          <b-form-select-option :value="null" disabled>{{ $t('language-editor.label.ielts-module-placeholder') }}</b-form-select-option>
        </template>
      </b-form-select>
    </b-form-group>
    <!-- score -->
    <b-form-group
      :label="$t('language-editor.label.ielts-score-label')"
      :description="$t('language-editor.message.ielts-score-description')"
      :state="score === null ? false : null"
      :invalid-feedback="$t('language-editor.message.ielts-score-no-selected')"
      label-for="ielts-score">
      <b-form-select id="ielts-score" :state="score === null ? false : null" :options="scores" :value="score" @change="updateScore">
        <template #first>
          <b-form-select-option :value="null" disabled>{{ $t('language-editor.label.ielts-score-placeholder') }}</b-form-select-option>
        </template>
      </b-form-select>
    </b-form-group>
  </div>
</template>

<script lang="ts">
import { BFormGroup, BFormSelect, BFormSelectOption } from 'bootstrap-vue';
import Vue from 'vue';
import { IELTS, IELTSType } from '@/clients/resume-data';
import { State } from './models';

export default Vue.extend({
  components: { BFormGroup, BFormSelect, BFormSelectOption },
  props: {
    state: {
      type: State,
      required: true
    }
  },
  data: function () {
    let type: IELTSType | null;
    let score: number | null;

    if (this.state.value instanceof IELTS) {
      type = this.state.value.type;
      score = this.state.value.bandScore;
    } else {
      type = null;
      score = null;
    }

    return { type, score };
  },
  computed: {
    types: function (): TypeItem[] {
      return [
        {
          text: this.$t('language-editor.label.ielts-academic') as string,
          value: IELTSType.Academic
        },
        {
          text: this.$t('language-editor.label.ielts-general') as string,
          value: IELTSType.GeneralTraining
        }
      ];
    },
    scores: function (): ScoreItem[] {
      const scores = new Array<number>();

      for (let i = 0; i <= 9; i += 0.5) {
        scores.push(i);
      }

      return scores.map(s => ({ text: s.toString(), value: s }));
    }
  },
  methods: {
    updateType: function (v: IELTSType | null): void {
      this.type = v;
      this.raiseInput();
    },
    updateScore: function (v: number | null): void {
      this.score = v;
      this.raiseInput();
    },
    raiseInput: function (): void {
      let v: IELTS | null;

      if (this.type !== null && this.score !== null) {
        v = new IELTS(this.type, this.score);
      } else {
        v = null;
      }

      this.$emit('input', v);
    }
  }
});

interface TypeItem {
  text: string;
  value: IELTSType | null;
}

interface ScoreItem {
  text: string;
  value: number | null;
}
</script>
