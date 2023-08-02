<template>
  <b-card-body>
    <data-field
      :input-id="`${id}-value`"
      :label="$t('resume-linkedin-username.label.header')"
      :description="desc()"
      :selector="selectValue"
      :validator="validateUsername"
      :model="value"
      v-on="value.handlers"
      v-slot="p"
      class="mb-0">
      <b-form-input
        :id="`${id}-value`"
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
      value: new FieldValue<string>()
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
      } else if (!validateUsername(v)) {
        return this.$t('linkedin-editor.message.invalid-username');
      } else {
        return null;
      }
    },
    createUpdate: function (w: UpdateWriter): void {
      const src = this.state.remote as DataProperty<string> | null;
      const update = this.value.toDto(src, trim);

      w.writeUpdate(update);
    }
  }
});

function validateUsername(v: string): boolean {
  if (v.length < 3 || v.length > 100) {
    return false;
  }

  for (const c of v) {
    const n = c.codePointAt(0)!;

    if (!isAllowedUsernameCharacter(n)) {
      return false;
    }
  }

  return true;
}

function isAllowedUsernameCharacter(c: number): boolean {
  return (c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || c === 0x2d;
}
</script>
