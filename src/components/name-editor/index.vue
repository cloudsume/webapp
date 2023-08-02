<template>
  <b-card-body>
    <!-- first name -->
    <data-field
      :input-id="`${id}-firstname`"
      :label="label('firstName')"
      :description="desc('first')"
      :selector="selectFirstName"
      :validator="requireValidString(100)"
      :model="firstName"
      v-on="firstName.handlers"
      v-slot="p">
      <b-form-input
        :id="`${id}-firstname`"
        :readonly="p.disabled"
        :state="p.state"
        :value="p.value"
        @update="p.update">
      </b-form-input>
    </data-field>
    <!-- middle name -->
    <data-field
      :input-id="`${id}-middlename`"
      :label="label('middleName')"
      :description="desc('middle')"
      :selector="selectMiddleName"
      :validator="requireValidString(100)"
      :model="middleName"
      v-on="middleName.handlers"
      v-slot="p">
      <b-form-input
        :id="`${id}-middlename`"
        :readonly="p.disabled"
        :state="p.state"
        :value="p.value"
        @update="p.update">
      </b-form-input>
    </data-field>
    <!-- last name -->
    <data-field
      :input-id="`${id}-lastname`"
      :label="label('lastName')"
      :description="desc('last')"
      :selector="selectLastName"
      :validator="requireValidString(100)"
      :model="lastName"
      v-on="lastName.handlers"
      v-slot="p"
      class="mb-0">
      <b-form-input
        :id="`${id}-lastname`"
        :readonly="p.disabled"
        :state="p.state"
        :value="p.value"
        @update="p.update">
      </b-form-input>
    </data-field>
  </b-card-body>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { DataProperty, ResumeName } from '@/clients/resume-data';
import { DataEditor, FieldValue, trim, UpdateWriter } from '@/components/data-editor';
import DataField from '@/components/data-field';

export default (Vue as VueConstructor<DataEditor>).extend({
  components: { DataField },
  mixins: [DataEditor],
  data: function () {
    return {
      firstName: new FieldValue<string>(),
      middleName: new FieldValue<string>(),
      lastName: new FieldValue<string>()
    };
  },
  methods: {
    selectFirstName: function (d: ResumeName): DataProperty<string> {
      return d.firstName;
    },
    selectMiddleName: function (d: ResumeName): DataProperty<string> {
      return d.middleName;
    },
    selectLastName: function (d: ResumeName): DataProperty<string> {
      return d.lastName;
    },
    createUpdate: function (w: UpdateWriter): void {
      const src = this.state.remote as ResumeName | null;
      const first = this.firstName.toDto(src?.firstName, trim);
      const middle = this.middleName.toDto(src?.middleName, trim);
      const last = this.lastName.toDto(src?.lastName, trim);
      const update = new ResumeName(first, middle, last);

      w.writeUpdate(update);
    }
  }
});
</script>
