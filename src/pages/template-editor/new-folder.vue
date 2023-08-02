<template>
  <modal :title="$t('template-editor.label.new-folder-title')" :ok-disabled="!valid" body-class="pb-0" v3 @ok="ok" @hidden="hidden" v-slot="{ ok }">
    <b-form novalidate @submit.prevent="ok()">
      <b-form-group
        :label="$t('template-editor.label.new-folder-name')"
        :description="$t('template-editor.message.new-folder-name')"
        :state="nameState"
        :invalid-feedback="nameError"
        label-for="new-folder-name">
        <b-form-input id="new-folder-name" :state="nameState" v-model="name"></b-form-input>
      </b-form-group>
    </b-form>
  </modal>
</template>

<script lang="ts">
import { BForm, BFormGroup, BFormInput } from 'bootstrap-vue';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import Modal, { Proceed } from '@/components/modal';
import { PageContext } from './models';
import { FileNameError, validateFileName } from './util';

export default Vue.extend({
  components: { BForm, BFormGroup, BFormInput, Modal },
  props: {
    context: {
      type: PageContext,
      required: true
    },
    parent: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      name: ''
    };
  },
  computed: {
    trimmedName: function (): string {
      return this.name.trim();
    },
    nameError: function (): TranslateResult | null {
      const name = this.trimmedName;

      switch (validateFileName(name, this.parent)) {
        case FileNameError.None:
          break;
        case FileNameError.TooShort:
          return this.$t('template-editor.message.new-name-blank');
        case FileNameError.TooLong:
          return this.$t('template-editor.message.new-name-too-long');
        case FileNameError.Reserved:
          return this.$t('template-editor.message.reserved-file');
        case FileNameError.HasInvalidChars:
          return this.$t('template-editor.message.new-name-invalid');
        default:
          throw new Error('Unknown validation result.');
      }

      if (this.context.files[`${this.parent}${name}`] !== undefined) {
        return this.$t('template-editor.message.new-name-duplicated');
      }

      return null;
    },
    nameState: function (): boolean | null {
      return this.nameError === null ? null : false;
    },
    valid: function (): boolean {
      return this.nameState === null;
    }
  },
  methods: {
    ok: function (proceed: Proceed): void {
      if (this.valid) {
        proceed(this.trimmedName);
      }
    },
    hidden: function (r: unknown): void {
      if (r !== undefined) {
        this.$emit('input', r);
      }

      this.$emit('hidden');
    }
  }
});
</script>
