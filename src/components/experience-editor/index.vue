<template>
  <BCardBody>
    <!-- start -->
    <DataField
      :input-id="`${id}-start`"
      :label="label('start')"
      :description="desc('start')"
      :selector="selectStart"
      :converter="noop"
      :validator="nonNull"
      :comparer="compareDateMonth"
      :model="start"
      v-on="start.handlers"
      v-slot="p">
      <DatemonthSelector :month-id="`${id}-start`" :disabled="p.disabled" :state="p.state" :value="p.value" @input="p.update"></DatemonthSelector>
    </DataField>
    <!-- end -->
    <DataField
      :input-id="`${id}-end`"
      :label="label('end')"
      :description="desc('end')"
      :selector="selectEnd"
      :converter="noop"
      :validator="nonNull"
      :comparer="compareDateMonth"
      :model="end"
      v-on="end.handlers"
      v-slot="p">
      <DatemonthSelector :month-id="`${id}-end`" :disabled="p.disabled" :state="p.state" :value="p.value" @input="p.update"></DatemonthSelector>
    </DataField>
    <!-- title -->
    <DataField
      :input-id="`${id}-title`"
      :label="label('title')"
      :description="desc('title')"
      :selector="selectTitle"
      :validator="string(100)"
      :model="title"
      v-on="title.handlers"
      v-slot="p">
      <BFormInput
        :id="`${id}-title`"
        :readonly="p.disabled"
        :state="p.state"
        :value="p.value"
        @update="p.update">
      </BFormInput>
    </DataField>
    <!-- company -->
    <DataField
      :input-id="`${id}-company`"
      :label="label('company')"
      :description="desc('company')"
      :selector="selectCompany"
      :validator="string(100)"
      :model="company"
      v-on="company.handlers"
      v-slot="p">
      <BFormInput
        :id="`${id}-company`"
        :readonly="p.disabled"
        :state="p.state"
        :value="p.value"
        @update="p.update">
      </BFormInput>
    </DataField>
    <!-- region -->
    <DataField
      :input-id="`${id}-region`"
      :label="label('region')"
      :description="desc('region')"
      :selector="selectRegion"
      :validator="nonEmpty"
      :model="region"
      v-on="region.handlers"
      v-slot="p">
      <DivisionSelector :country-id="`${id}-region`" :disabled="p.disabled" :state="p.state" :value="p.value" @input="p.update"></DivisionSelector>
    </DataField>
    <!-- street -->
    <DataField
      :input-id="`${id}-street`"
      :label="label('street')"
      :description="desc('street')"
      :selector="selectStreet"
      :validator="string(100)"
      :model="street"
      v-on="street.handlers"
      v-slot="p">
      <BFormInput
        :id="`${id}-street`"
        :readonly="p.disabled"
        :state="p.state"
        :value="p.value"
        @update="p.update">
      </BFormInput>
    </DataField>
    <!-- description -->
    <DataField
      :input-id="`${id}-description`"
      :label="label('description')"
      :description="desc('description')"
      :selector="selectDescription"
      :validator="string(1000)"
      :model="description"
      v-on="description.handlers"
      v-slot="p"
      class="mb-0">
      <MarkdownInput :input-id="`${id}-description`" :disabled="p.disabled" :state="p.state" :value="p.value" @input="p.update"></MarkdownInput>
    </DataField>
  </BCardBody>
</template>

<script setup lang="ts">
import { BCardBody, BFormInput } from 'bootstrap-vue';
import { reactive } from 'vue';
import { DateMonth } from '@/clients/rest';
import { DataProperty, ResumeExperience } from '@/clients/resume-data';
import { DataFlags, DataState, FieldValue, ResultFactory, toNonNull, trim, useDataEditor } from '@/components/data-editor';
import DataField, { compareDateMonth, noop } from '@/components/data-field';
import DatemonthSelector from '@/components/datemonth-selector';
import DivisionSelector from '@/components/division-selector';
import MarkdownInput from '@/components/markdown-input';
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
const start: FieldValue<DateMonth | null> = reactive(new FieldValue());
const end: FieldValue<DateMonth | null> = reactive(new FieldValue());
const title: FieldValue<string> = reactive(new FieldValue());
const company: FieldValue<string> = reactive(new FieldValue());
const region: FieldValue<string> = reactive(new FieldValue());
const street: FieldValue<string> = reactive(new FieldValue());
const description: FieldValue<string> = reactive(new FieldValue());

// functions
const selectStart = function (d: ResumeExperience): DataProperty<DateMonth> {
  return d.start;
};

const selectEnd = function (d: ResumeExperience): DataProperty<DateMonth> {
  return d.end;
};

const selectTitle = function (d: ResumeExperience): DataProperty<string> {
  return d.title;
};

const selectCompany = function (d: ResumeExperience): DataProperty<string> {
  return d.company;
};

const selectRegion = function (d: ResumeExperience): DataProperty<string> {
  return d.region;
};

const selectStreet = function (d: ResumeExperience): DataProperty<string> {
  return d.street;
};

const selectDescription = function (d: ResumeExperience): DataProperty<string> {
  return d.description;
};

// apply common editor
const { label, desc, nonNull, nonEmpty, string } = useDataEditor(props, emit, { start, end, title, company, region, street, description }, function (w) {
  const src = props.state.remote as ResumeExperience | null;
  const parent = w.getParent();
  const start = this.start.toDto(src?.start, toNonNull);
  const end = this.end.toDto(src?.end, toNonNull);
  const title = this.title.toDto(src?.title, trim);
  const company = this.company.toDto(src?.company, trim);
  const region = this.region.toDto(src?.region);
  const street = this.street.toDto(src?.street, trim);
  const desc = this.description.toDto(src?.description, trim);
  const update = new ResumeExperience(src?.id ?? NilUUID, parent, start, end, title, company, region, street, desc);

  w.writeUpdate(update);
});
</script>
