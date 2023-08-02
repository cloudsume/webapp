<template>
  <b-card-body>
    <data-field
      :input-id="`${id}-value`"
      :label="label()"
      :description="desc()"
      :selector="selectValue"
      :validator="requireValidString(100)"
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
    createUpdate: function (w: UpdateWriter): void {
      const src = this.state.remote as DataProperty<string> | null;
      const update = this.value.toDto(src, trim);

      w.writeUpdate(update);
    }
  }
});
</script>
