<template>
  <BCardBody>
    <!-- name -->
    <DataField
      :input-id="`${id}-name`"
      :label="label('name')"
      :description="desc('name')"
      :selector="selectName"
      :validator="string(100)"
      :model="name"
      v-on="name.handlers"
      v-slot="p">
      <BFormInput :id="`${id}-name`" :readonly="p.disabled" :state="p.state" :value="p.value" @update="p.update"></BFormInput>
    </DataField>
    <!-- obtained -->
    <DataField
      :input-id="`${id}-obtained`"
      :label="label('obtained')"
      :description="desc('obtained')"
      :selector="selectObtained"
      :converter="noop"
      :validator="nonNull"
      :comparer="compareDateMonth"
      :model="obtained"
      v-on="obtained.handlers"
      v-slot="p"
      class="mb-0">
      <DatemonthSelector :month-id="`${id}-obtained`" :disabled="p.disabled" :state="p.state" :value="p.value" @input="p.update"></DatemonthSelector>
    </DataField>
  </BCardBody>
</template>

<script setup lang="ts">
import { BCardBody, BFormInput } from 'bootstrap-vue';
import { reactive } from 'vue';
import { DateMonth } from '@/clients/rest';
import { ResumeCertificate } from '@/clients/resume-data';
import { DataFlags, DataState, FieldValue, useDataEditor, ResultFactory, toNonNull, trim } from '@/components/data-editor';
import DataField, { compareDateMonth, noop } from '@/components/data-field';
import DatemonthSelector from '@/components/datemonth-selector';
import { NilUUID } from '@/util/uuid';

// props & emit
const props = defineProps({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    required: true
  },
  state: {
    type: DataState,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'result', v: ResultFactory): void;
  (e: 'change', v: DataFlags): void;
  (e: 'dirty', v: boolean): void;
}>();

// local states
const name: FieldValue<string> = reactive(new FieldValue());
const obtained: FieldValue<DateMonth | null> = reactive(new FieldValue());

// functions
const selectName = function (d: ResumeCertificate) {
  return d.name;
};

const selectObtained = function (d: ResumeCertificate) {
  return d.obtained;
};

// apply common editor
const { label, desc, nonNull, string } = useDataEditor(props, emit, { name, obtained }, function (w) {
  const src = props.state.remote as ResumeCertificate | null;
  const parent = w.getParent();
  const name = this.name.toDto(src?.name, trim);
  const obtained = this.obtained.toDto(src?.obtained, toNonNull);
  const update = new ResumeCertificate(src?.id ?? NilUUID, parent, name, obtained);

  w.writeUpdate(update);
});
</script>
