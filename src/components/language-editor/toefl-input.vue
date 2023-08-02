<template>
  <b-form-group
    :label="$t('language-editor.label.toefl-score-label')"
    :description="$t('language-editor.message.toefl-score-description')"
    :state="valid ? null : false"
    :invalid-feedback="$t('language-editor.message.toefl-invalid')"
    label-for="toefl-score-input">
    <b-form-input id="toefl-score-input" type="number" :state="valid ? null : false" :value="value" number no-wheel @update="update"></b-form-input>
  </b-form-group>
</template>

<script lang="ts">
import { BFormGroup, BFormInput } from 'bootstrap-vue';
import Vue from 'vue';
import { State } from './models';

export default Vue.extend({
  components: { BFormGroup, BFormInput },
  props: {
    state: {
      type: State,
      required: true
    }
  },
  data: function () {
    let value: string | number;

    if (this.state.value === null) {
      value = '';
    } else {
      value = this.state.value as number;
    }

    return { value, valid: validate(value) };
  },
  methods: {
    update: function (v: string | number): void {
      this.value = v;
      this.valid = validate(v);
      this.$emit('input', this.valid ? v : null);
    }
  }
});

function validate(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 120;
}
</script>
