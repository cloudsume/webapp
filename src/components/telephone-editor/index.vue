<template>
  <b-card-body>
    <data-field
      :input-id="`${id}-value`"
      :label="label()"
      :description="desc()"
      :selector="selectValue"
      :converter="convertTelephoneNumber"
      :validator="requireNonNull"
      :comparer="compareTelephoneNumber"
      :model="value"
      v-on="value.handlers"
      v-slot="p"
      class="mb-0">
      <telephone-input
        :number-id="`${id}-value`"
        :disabled="p.disabled"
        :state="p.state"
        :value="p.value"
        @input="p.update"
        @valid="p.valid"
        @invalid="p.invalid">
      </telephone-input>
    </data-field>
  </b-card-body>
</template>

<script lang="ts">
import { BCardBody } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { TelephoneNumber } from '@/clients/rest';
import { DataProperty } from '@/clients/resume-data';
import { DataEditor, FieldValue, toNonNull, UpdateWriter } from '@/components/data-editor';
import DataField from '@/components/data-field';
import TelephoneInput from '@/components/telephone-input';

export default (Vue as VueConstructor<DataEditor>).extend({
  components: { BCardBody, DataField, TelephoneInput },
  mixins: [DataEditor],
  data: function () {
    return {
      value: new FieldValue<TelephoneNumber | null>()
    };
  },
  methods: {
    selectValue: function (d: DataProperty<TelephoneNumber>): DataProperty<TelephoneNumber> {
      return d;
    },
    createUpdate: function (w: UpdateWriter): void {
      const src = this.state.remote as DataProperty<TelephoneNumber> | null;
      const update = this.value.toDto(src, toNonNull);

      w.writeUpdate(update);
    }
  }
});
</script>
