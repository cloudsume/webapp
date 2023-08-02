<template>
  <b-card-body>
    <!-- skill -->
    <data-field
      :input-id="`${id}-skill`"
      :label="label('name')"
      :description="desc('name')"
      :selector="selectSkill"
      :validator="requireValidString(100)"
      :model="skill"
      v-on="skill.handlers"
      v-slot="p">
      <b-form-input
        :id="`${id}-skill`"
        :readonly="p.disabled"
        :state="p.state"
        :value="p.value"
        @update="p.update">
      </b-form-input>
    </data-field>
    <!-- level -->
    <data-field
      :input-id="`${id}-level`"
      :label="label('level')"
      :description="desc('proficiency')"
      :selector="selectLevel"
      :converter="convertNoop"
      :validator="requireNonNull"
      :model="level"
      v-on="level.handlers"
      v-slot="p"
      class="mb-0">
      <b-form-select :id="`${id}-level`" :options="levels" :disabled="p.disabled" :state="p.state" :value="p.value" @change="p.update">
      </b-form-select>
    </data-field>
  </b-card-body>
</template>

<script lang="ts">
import { BCardBody, BFormInput, BFormSelect } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { DataProperty, ResumeSkill, SkillLevel } from '@/clients/resume-data';
import { DataEditor, FieldValue, getSkillLevelLabel, toNonNull, trim, UpdateWriter } from '@/components/data-editor';
import DataField from '@/components/data-field';
import { NilUUID } from '@/util/uuid';

export default (Vue as VueConstructor<DataEditor>).extend({
  components: { BCardBody, BFormInput, BFormSelect, DataField },
  mixins: [DataEditor],
  data: function () {
    return {
      skill: new FieldValue<string>(),
      level: new FieldValue<SkillLevel | null>()
    };
  },
  computed: {
    levels: function (): LevelItem[] {
      return [
        {
          text: this.$t('resume-skill-level.label.placeholder') as string,
          value: null
        },
        {
          text: getSkillLevelLabel(this.$i18n, SkillLevel.Novice) as string,
          value: SkillLevel.Novice
        },
        {
          text: getSkillLevelLabel(this.$i18n, SkillLevel.Expert) as string,
          value: SkillLevel.Expert
        }
      ]
    }
  },
  methods: {
    selectSkill: function (d: ResumeSkill): DataProperty<string> {
      return d.name;
    },
    selectLevel: function (d: ResumeSkill): DataProperty<SkillLevel> {
      return d.level;
    },
    createUpdate: function (w: UpdateWriter): void {
      const src = this.state.remote as ResumeSkill | null;
      const parent = w.getParent();
      const name = this.skill.toDto(src?.name, trim);
      const level = this.level.toDto(src?.level, toNonNull);
      const update = new ResumeSkill(src?.id ?? NilUUID, parent, name, level);

      w.writeUpdate(update);
    }
  }
});

interface LevelItem {
  text: string;
  value: SkillLevel | null;
}
</script>
