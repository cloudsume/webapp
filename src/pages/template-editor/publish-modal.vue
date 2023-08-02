<template>
  <modal
    :title="$t('template-editor.label.publish-title')"
    :context="visible ? true : null"
    body-class="position-static pb-0"
    v2
    @show="populate"
    @change="$emit('change', false)"
    @hide="hiding"
    @hidden="reset">
    <!-- form -->
    <template v-slot="{}">
      <!-- first time publishing -->
      <template v-if="!templates.length">
        <p>{{ $t('template-editor.message.publish-info') }}</p>
        <ul>
          <li>{{ $t('template-editor.message.publish-applicable-jobs-restriction') }}</li>
          <li>{{ $t('template-editor.message.publish-category-restriction') }}</li>
          <li>{{ $t('template-editor.message.publish-preview-restriction') }}</li>
        </ul>
      </template>
      <!-- later publishing -->
      <b-form v-else novalidate @submit="submit">
        <b-form-textarea :placeholder="$t('template-editor.label.publish-release-note')" :state="noteState" rows="16" class="mb-3" v-model="note">
        </b-form-textarea>
      </b-form>
    </template>
    <!-- loading -->
    <template #post-body="{}">
      <b-overlay :show="busy" opacity="1" no-wrap rounded no-fade></b-overlay>
    </template>
    <!-- footer -->
    <template #modal-footer="{}">
      <!-- we don't want cancel button here to prevent accidentally clicking on a publish instead -->
      <b-button :disabled="busy || noteState !== null" variant="danger" @click="publish">{{ $t('template-editor.label.publish-publish') }}</b-button>
    </template>
  </modal>
</template>

<script lang="ts">
import { BButton, BForm, BFormTextarea, BOverlay, BvModalEvent } from 'bootstrap-vue';
import Vue from 'vue';
import { ReleaseTemplate, TemplateRegistrationService } from '@/clients/template-registration';
import Modal from '@/components/modal';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';

export default Vue.extend({
  components: { BButton, BForm, BFormTextarea, BOverlay, Modal },
  model: {
    prop: 'visible',
    event: 'change'
  },
  props: {
    regId: {
      type: Uuid,
      required: true
    },
    visible: Boolean
  },
  data: function () {
    return {
      templates: new Array<ULID>(),
      note: '',
      result: null as ULID | null,
      busy: true
    };
  },
  computed: {
    trimmedNote: function (): string {
      return this.note.trim();
    },
    noteState: function (): boolean | null {
      return this.trimmedNote.length <= 10000 ? null : false;
    }
  },
  methods: {
    populate: async function (): Promise<void> {
      const service = new TemplateRegistrationService(this.$rest);

      try {
        this.templates = await service.listTemplates(this.regId);
      } catch {
        // TODO: display alert
      } finally {
        this.busy = false;
      }
    },
    submit: function (e: Event): void {
      e.preventDefault();

      if (!this.busy && this.noteState === null) {
        this.publish();
      }
    },
    publish: async function (): Promise<void> {
      const service = new TemplateRegistrationService(this.$rest);
      const release = new ReleaseTemplate(this.trimmedNote);

      this.busy = true;

      try {
        this.result = await service.release(this.regId, release);
      } catch (e) {
        // TODO: display alert
        this.busy = false;
        return;
      }

      this.$emit('input', this.result);
    },
    hiding: function (e: BvModalEvent): void {
      if (this.busy && this.result === null) {
        e.preventDefault();
      }
    },
    reset: function (): void {
      this.templates = [];
      this.note = '';
      this.result = null;
      this.busy = true;
    }
  }
});
</script>
