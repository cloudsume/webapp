<template>
  <b-card-body>
    <!-- region -->
    <data-field
      :input-id="`${id}-region`"
      :label="label('region')"
      :description="desc('region')"
      :selector="selectRegion"
      :validator="requireNonEmpty"
      :model="region"
      v-on="region.handlers"
      v-slot="p">
      <division-selector :country-id="`${id}-region`" :disabled="p.disabled" :state="p.state" :value="p.value" @input="p.update"></division-selector>
    </data-field>
    <!-- street -->
    <data-field
      :input-id="`${id}-street`"
      :label="label('street')"
      :description="desc('street')"
      :selector="selectStreet"
      :validator="requireValidString(100)"
      :model="street"
      v-on="street.handlers"
      v-slot="p"
      class="mb-0">
      <b-form-input
        :id="`${id}-street`"
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
import { DataProperty, ResumeAddress } from '@/clients/resume-data';
import { DataEditor, FieldValue, trim, UpdateWriter } from '@/components/data-editor';
import DataField from '@/components/data-field';
import DivisionSelector from '@/components/division-selector';

export default (Vue as VueConstructor<DataEditor>).extend({
  components: { BCardBody, BFormInput, DataField, DivisionSelector },
  mixins: [DataEditor],
  data: function () {
    return {
      region: new FieldValue<string>(),
      street: new FieldValue<string>()
    };
  },
  methods: {
    selectRegion: function (d: ResumeAddress): DataProperty<string> {
      return d.region;
    },
    selectStreet: function (d: ResumeAddress): DataProperty<string> {
      return d.street;
    },
    createUpdate: function (w: UpdateWriter): void {
      const src = this.state.remote as ResumeAddress | null;
      const region = this.region.toDto(src?.region);
      const street = this.street.toDto(src?.street, trim);
      const update = new ResumeAddress(region, street);

      w.writeUpdate(update);
    }
  }
});
</script>
