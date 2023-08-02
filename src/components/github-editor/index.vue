<template>
  <b-card-body>
    <data-field
      :input-id="`${id}-username`"
      :label="$t('resume-github-username.label.header')"
      :description="desc()"
      :selector="selectValue"
      :validator="validateUsername"
      :model="username"
      v-on="username.handlers"
      v-slot="p"
      class="mb-0">
      <b-form-input
        :id="`${id}-username`"
        :readonly="p.disabled"
        :state="p.state"
        :value="p.value"
        @update="p.update">
      </b-form-input>
    </data-field>
  </b-card-body>
</template>

<script lang="ts">
import { BCardBody, BFormInput } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { TranslateResult } from 'vue-i18n';
import { DataProperty } from '@/clients/resume-data';
import { DataEditor, FieldValue, trim, UpdateWriter } from '@/components/data-editor';
import DataField from '@/components/data-field';

export default (Vue as VueConstructor<DataEditor>).extend({
  components: { BCardBody, BFormInput, DataField },
  mixins: [DataEditor],
  data: function () {
    return {
      username: new FieldValue<string>()
    };
  },
  methods: {
    selectValue: function (d: DataProperty<string>): DataProperty<string> {
      return d;
    },
    validateUsername: function (v: string): TranslateResult | null {
      v = v.trim();

      if (!v) {
        return this.noInputError;
      } else if (v.length > 39) {
        return this.$t('github-editor.message.username-too-long');
      } else if (!isValidUsername(v)) {
        return this.$t('github-editor.message.invalid-username');
      } else {
        return null;
      }
    },
    createUpdate: function (w: UpdateWriter): void {
      const src = this.state.remote as DataProperty<string> | null;
      const update = this.username.toDto(src, trim);

      w.writeUpdate(update);
    }
  }
});

function isValidUsername(v: string): boolean {
  let hp = 0;

  for (let i = 0; i < v.length; i++) {
    const c = v.codePointAt(i)!;

    if (c === 0x2d) {
      // hyphen
      if (++hp > 1 || i === 0 || i === (v.length - 1)) {
        return false;
      }
    } else if (!isAlphanumeric(c)) {
      return false;
    } else {
      hp = 0;
    }
  }

  return true;
}

function isAlphanumeric(c: number): boolean {
  const isNumeric = c >= 0x30 && c <= 0x39;
  const isLowerCaseAlphabetic = c >= 0x41 && c <= 0x5a;
  const isUpperCaseAlphabetic = c >= 0x61 && c <= 0x7a;

  return isNumeric || isLowerCaseAlphabetic || isUpperCaseAlphabetic;
}
</script>
