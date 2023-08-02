<template>
  <modal
    :title="$t('template-editor.label.skill-options-title')"
    :context="visible ? true : null"
    body-class="position-static pb-0"
    v2
    @show="populate"
    @change="$emit('change', false)"
    @hide="hiding"
    @hidden="reset">
    <!-- form -->
    <template v-slot="{}">
      <b-form novalidate @submit="submit">
        <b-form-group
          :label="$t('template-editor.label.skill-options-grouping')"
          :description="$t('template-editor.message.skill-options-grouping')"
          label-for="skill-options-grouping">
          <b-form-select id="skill-options-grouping" v-model="grouping">
            <b-form-select-option :value="0">{{ $t('template-editor.label.skill-options-none') }}</b-form-select-option>
            <b-form-select-option :value="1">{{ $t('template-editor.label.skill-options-level') }}</b-form-select-option>
          </b-form-select>
        </b-form-group>
      </b-form>
    </template>
    <!-- loading -->
    <template #post-body="{}">
      <b-overlay :show="busy" no-wrap rounded no-fade></b-overlay>
    </template>
    <!-- footer -->
    <template #modal-footer="{ cancel }">
      <b-button :disabled="busy" @click="cancel">{{ $t('template-editor.label.skill-options-cancel') }}</b-button>
      <b-button :disabled="busy" variant="primary" @click="save">{{ $t('template-editor.label.skill-options-save') }}</b-button>
    </template>
  </modal>
</template>

<script lang="ts">
import { BButton, BForm, BFormGroup, BFormSelect, BFormSelectOption, BOverlay, BvModalEvent } from 'bootstrap-vue';
import Vue from 'vue';
import { SkillGrouping, SkillOptions, TemplateRegistrationService } from '@/clients/template-registration';
import Modal from '@/components/modal';
import { Uuid } from '@/util/uuid';
import { PageContext } from './models';

export default Vue.extend({
  components: { BButton, BForm, BFormGroup, BFormSelect, BFormSelectOption, BOverlay, Modal },
  model: {
    prop: 'visible',
    event: 'change'
  },
  props: {
    regId: {
      type: Uuid,
      required: true
    },
    context: {
      type: PageContext,
      required: true
    },
    visible: Boolean
  },
  data: function () {
    return {
      grouping: SkillGrouping.None,
      busy: false,
      saved: false
    };
  },
  methods: {
    populate: function (): void {
      this.grouping = this.context.options.skill.grouping;
    },
    submit: function (e: Event): void {
      e.preventDefault();

      if (!this.busy) {
        this.save();
      }
    },
    save: async function (): Promise<void> {
      const service = new TemplateRegistrationService(this.$rest);
      const update = new SkillOptions(this.grouping);

      this.busy = true;

      try {
        await service.writeWorkspaceSkillOptions(this.regId, update);
      } catch (e) {
        // TODO: display alert
        this.busy = false;
        return;
      }

      this.saved = true;
      this.$emit('input', update);
      this.$emit('change', false);
    },
    hiding: function (e: BvModalEvent): void {
      if (this.busy && !this.saved) {
        e.preventDefault();
      }
    },
    reset: function (): void {
      this.grouping = SkillGrouping.None;
      this.busy = false;
      this.saved = false;
    }
  }
});
</script>
