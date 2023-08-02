<template>
  <modal
    :title="$t('template-editor.label.new-title')"
    body-class="pb-0"
    :ok-disabled="!valid"
    v3
    @ok="ok"
    @hidden="hidden"
    v-slot="{ ok }">
    <b-form novalidate @submit.prevent="ok()">
      <!-- import -->
      <b-form-group
        :label="$t('template-editor.label.new-upload')"
        :description="$t('template-editor.message.new-upload')"
        :state="uploadState"
        :invalid-feedback="uploadError"
        label-for="filecontent">
        <b-form-file
          id="filecontent"
          :state="uploadState"
          :placeholder="$t('template-editor.label.new-upload-ph')"
          :browse-text="$t('template-editor.label.new-upload-browse')"
          :value="upload"
          @input="updateUpload">
        </b-form-file>
      </b-form-group>
      <!-- name -->
      <b-form-group
        :label="$t('template-editor.label.new-name')"
        :description="$t('template-editor.message.new-name')"
        :state="nameState"
        :invalid-feedback="nameError"
        label-for="filename">
        <b-form-input id="filename" :state="nameState" v-model="name"></b-form-input>
      </b-form-group>
    </b-form>
  </modal>
</template>

<script lang="ts">
import { BForm, BFormFile, BFormGroup, BFormInput } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { TranslateResult } from 'vue-i18n';
import Modal, { Proceed } from '@/components/modal';
import { PageComponent } from './component';
import { FileNameError, getFileContent, validateFileName } from './util';

export default (Vue as VueConstructor<PageComponent>).extend({
  components: { BForm, BFormFile, BFormGroup, BFormInput, Modal },
  mixins: [PageComponent],
  data: function () {
    return {
      upload: null as File | null,
      name: ''
    };
  },
  computed: {
    uploadState: function (): boolean | null {
      return this.uploadError === null ? null : false;
    },
    uploadError: function (): TranslateResult | null {
      if (this.upload === null) {
        return null;
      } else if (this.upload.size + this.context.size > 1024 * 1024 * 5) {
        return this.$t('template-editor.message.new-upload-too-large');
      } else {
        return null;
      }
    },
    trimmedName: function (): string {
      return this.name.trim();
    },
    nameState: function (): boolean | null {
      return this.nameError === null ? null : false;
    },
    nameError: function (): TranslateResult | null {
      const name = this.trimmedName;
      const parent = this.context.path;

      switch (validateFileName(name, parent)) {
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

      if (this.context.files[`${parent}${name}`] !== undefined) {
        return this.$t('template-editor.message.new-name-duplicated');
      }

      return null;
    },
    valid: function (): boolean {
      return this.uploadState === null && this.nameState === null;
    }
  },
  methods: {
    updateUpload: function (v: File | null): void {
      this.upload = v;

      if (v) {
        this.name = v.name;
      }
    },
    ok: async function (proceed: Proceed): Promise<void> {
      if (!this.valid) {
        return;
      }

      let content: unknown = this.upload;

      if (content === null) {
        content = '';
      } else {
        // we don't need to toggle busy flag here due to content is a local file
        content = await getFileContent(this.trimmedName, content as File);
      }

      proceed({ name: this.trimmedName, content });
    },
    hidden: function (r: Result | undefined): void {
      if (r) {
        this.$emit('input', r.name, r.content);
      }

      this.$emit('hidden');
    }
  }
});

interface Result {
  name: string;
  content: unknown;
}
</script>
