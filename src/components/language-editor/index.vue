<template>
  <b-card-body>
    <!-- language -->
    <data-field
      :input-id="`${id}-language`"
      :label="label('tag')"
      :description="desc('language')"
      :selector="selectTag"
      :validator="requireNonEmpty"
      :model="tag"
      v-on="tag.handlers"
      v-slot="p">
      <b-form-select
        :id="`${id}-language`"
        :disabled="p.disabled"
        :state="p.state"
        :options="tags"
        :value="p.value"
        @change="p.update">
        <template #first>
          <b-form-select-option value="" disabled>{{ $t('resume-language-language.label.placeholder') }}</b-form-select-option>
        </template>
      </b-form-select>
    </data-field>
    <!-- proficiency -->
    <data-field
      :input-id="`${id}-proficiency`"
      :label="label('proficiency')"
      :description="desc('proficiency')"
      :selector="selectProficiency"
      :converter="convertNoop"
      :validator="requireNonNull"
      :comparer="compareProficiency"
      :model="proficiency"
      v-on="proficiency.handlers"
      v-slot="p">
      <proficiency-input
        :button-id="`${id}-proficiency`"
        :disabled="p.disabled"
        :state="p.state"
        :value="p.value"
        @input="p.update">
      </proficiency-input>
    </data-field>
    <!-- comment -->
    <data-field
      :input-id="`${id}-comment`"
      :label="label('comment')"
      :description="desc('comment')"
      :selector="selectComment"
      :validator="requireValidString(100)"
      :model="comment"
      v-on="comment.handlers"
      v-slot="p"
      class="mb-0">
      <b-form-input :id="`${id}-comment`" :readonly="p.disabled" :state="p.state" :value="p.value" @update="p.update"></b-form-input>
    </data-field>
  </b-card-body>
</template>

<script lang="ts">
import { BCardBody, BFormInput, BFormSelect, BFormSelectOption } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { DataProperty, IELTS, LanguageProficiency, LanguageProficiencyType, ResumeLanguage } from '@/clients/resume-data';
import { DataEditor, FieldValue, toNonNull, trim, UpdateWriter } from '@/components/data-editor';
import DataField from '@/components/data-field';
import { getLanguageName } from '@/i18n';
import { NilUUID } from '@/util/uuid';
import ProficiencyInput from './proficiency-input.vue';

export default (Vue as VueConstructor<DataEditor>).extend({
  components: { BCardBody, BFormInput, BFormSelect, BFormSelectOption, DataField, ProficiencyInput },
  mixins: [DataEditor],
  data: function () {
    return {
      tag: new FieldValue<string>(),
      proficiency: new FieldValue<LanguageProficiency | null>(),
      comment: new FieldValue<string>()
    };
  },
  computed: {
    tags: function (): LanguageItem[] {
      const locale = this.$store.state.locale;
      const languages = ['en', 'hi', 'th'];
      const mapper = (tag: string) => ({ text: getLanguageName(tag, locale), value: tag });

      return languages.map(mapper).sort((a, b) => a.text.localeCompare(b.text, locale));
    }
  },
  methods: {
    selectTag: function (d: ResumeLanguage): DataProperty<string> {
      return d.tag;
    },
    selectProficiency: function (d: ResumeLanguage): DataProperty<LanguageProficiency> {
      return d.proficiency;
    },
    selectComment: function (d: ResumeLanguage): DataProperty<string> {
      return d.comment;
    },
    compareProficiency: function (local: LanguageProficiency | null, remote: LanguageProficiency | null): boolean {
      if (local === null && remote === null) {
        return true;
      } else if (local && remote) {
        if (local.type !== remote.type) {
          return false;
        }

        switch (local.type) {
          case LanguageProficiencyType.ILR:
          case LanguageProficiencyType.TOEIC:
          case LanguageProficiencyType.TOEFL:
            return local.value === remote.value;
          case LanguageProficiencyType.IELTS:
            return compareIELTS(local.value as IELTS, remote.value as IELTS);
          default:
            throw new Error(`Unknow proficiency type '${local.type}'.`);
        }
      } else {
        return false;
      }
    },
    createUpdate: function (w: UpdateWriter): void {
      const src = this.state.remote as ResumeLanguage | null;
      const parent = w.getParent();
      const tag = this.tag.toDto(src?.tag);
      const proficiency = this.proficiency.toDto(src?.proficiency, toNonNull);
      const comment = this.comment.toDto(src?.comment, trim);
      const update = new ResumeLanguage(src?.id ?? NilUUID, parent, tag, proficiency, comment);

      w.writeUpdate(update);
    }
  }
});

function compareIELTS<T extends IELTS>(a: T, b: T): boolean {
  return a.type === b.type && a.bandScore === b.bandScore;
}

interface LanguageItem {
  text: string;
  value: string;
}
</script>
