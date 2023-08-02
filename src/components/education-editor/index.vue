<template>
  <BCardBody>
    <!-- institute -->
    <DataField
      :input-id="`${id}-institute`"
      :label="label('institute')"
      :description="desc('institute')"
      :selector="selectInstitute"
      :validator="string(100)"
      :model="institute"
      v-on="institute.handlers"
      v-slot="p">
      <BFormInput
        :id="`${id}-institute`"
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
    <!-- degree -->
    <DataField
      :input-id="`${id}-degree`"
      :label="label('degreeName')"
      :description="desc('degree')"
      :selector="selectDegree"
      :validator="string(100)"
      :model="degree"
      v-on="degree.handlers"
      v-slot="p">
      <BFormInput
        :id="`${id}-degree`"
        :readonly="p.disabled"
        :state="p.state"
        :value="p.value"
        @update="p.update">
      </BFormInput>
    </DataField>
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
    <!-- grade -->
    <DataField
      :input-id="`${id}-grade`"
      :label="label('grade')"
      :description="desc('grade')"
      :selector="selectGrade"
      :validator="string(30)"
      :model="grade"
      v-on="grade.handlers"
      v-slot="p">
      <BFormInput
        :id="`${id}-grade`"
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
import { DataProperty, ResumeEducation } from '@/clients/resume-data';
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
const institute: FieldValue<string> = reactive(new FieldValue());
const region: FieldValue<string> = reactive(new FieldValue());
const degree: FieldValue<string> = reactive(new FieldValue());
const start: FieldValue<DateMonth | null> = reactive(new FieldValue());
const end: FieldValue<DateMonth | null> = reactive(new FieldValue());
const grade: FieldValue<string> = reactive(new FieldValue());
const description: FieldValue<string> = reactive(new FieldValue());

// functions
const selectInstitute = function (d: ResumeEducation): DataProperty<string> {
  return d.institute;
};

const selectRegion = function (d: ResumeEducation): DataProperty<string> {
  return d.region;
};

const selectDegree = function (d: ResumeEducation): DataProperty<string> {
  return d.degreeName;
};

const selectStart = function (d: ResumeEducation): DataProperty<DateMonth> {
  return d.start;
};

const selectEnd = function (d: ResumeEducation): DataProperty<DateMonth> {
  return d.end;
};

const selectGrade = function (d: ResumeEducation): DataProperty<string> {
  return d.grade;
};

const selectDescription = function (d: ResumeEducation): DataProperty<string> {
  return d.description;
};

// apply common editor
const { label, desc, nonNull, nonEmpty, string } = useDataEditor(props, emit, { institute, region, degree, start, end, grade, description }, function (w) {
  const src = props.state.remote as ResumeEducation | null;
  const parent = w.getParent();
  const institute = this.institute.toDto(src?.institute, trim);
  const region = this.region.toDto(src?.region);
  const degree = this.degree.toDto(src?.degreeName, trim);
  const start = this.start.toDto(src?.start, toNonNull);
  const end = this.end.toDto(src?.end, toNonNull);
  const grade = this.grade.toDto(src?.grade, trim);
  const desc = this.description.toDto(src?.description, trim);
  const update = new ResumeEducation(src?.id ?? NilUUID, parent, institute, region, degree, start, end, grade, desc);

  w.writeUpdate(update);
});
</script>
