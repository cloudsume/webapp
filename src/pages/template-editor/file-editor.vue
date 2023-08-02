<template>
  <div v-if="busy" class="d-flex justify-content-center align-items-center pb-3">
    <b-spinner></b-spinner>
  </div>
  <div v-else-if="selected" class="d-flex flex-column">
    <!-- editor -->
    <source-editor v-if="type === 'text'"
      :key="`editor-${name}`"
      :initial="content"
      :language="subtype"
      class="flex-grow-1 mb-2"
      style="min-height: 500px"
      @change="$emit('input', $event)">
    </source-editor>
    <div v-else class="flex-grow-1 d-flex justify-content-center align-items-center">
      <p class="lead mb-2">{{ $t('template-editor.message.no-editor') }}</p>
    </div>
    <!-- action panel -->
    <div class="mb-3 d-flex justify-content-between justify-content-lg-end align-items-center">
      <b-button variant="link" class="p-0 d-lg-none" @click="scrollToTop">
        {{ $t('template-editor.label.top-link') }}
      </b-button>
      <b-button :disabled="!canSave" variant="primary" @click="$emit('save')">
        {{ $t('template-editor.label.save') }}
      </b-button>
    </div>
  </div>
  <div v-else class="d-flex justify-content-center align-items-center">
    <p class="lead">
      {{ $t('template-editor.message.no-file-selected') }}
    </p>
  </div>
</template>

<script lang="ts">
import { BButton, BSpinner } from 'bootstrap-vue';
import Vue from 'vue';
import { TemplateAsset } from '@/clients/template-registration';
import SourceEditor from '@/components/source-editor';
import { PageContext } from './models';

export default Vue.extend({
  components: { BButton, BSpinner, SourceEditor },
  props: {
    context: {
      type: PageContext,
      required: true
    }
  },
  computed: {
    selected: function (): TemplateAsset | null {
      return this.context.selected;
    },
    name: function (): string | null {
      if (this.selected) {
        return this.selected.name;
      } else {
        return null;
      }
    },
    type: function (): FileType | null {
      const content = this.content;

      if (content === null) {
        return null;
      } else if (typeof content === 'string') {
        return FileType.Text;
      } else if (content instanceof Blob) {
        return FileType.Binary;
      } else {
        throw new Error(`Unknow file for ${this.name}.`);
      }
    },
    subtype: function (): string | null {
      const name = this.name;

      if (name === null) {
        return null;
      } else if (name.endsWith('.stg')) {
        return 'resume';
      } else if (name.endsWith('.cls')) {
        return 'tex';
      } else {
        return null;
      }
    },
    content: function (): unknown {
      const name = this.name;

      if (name !== null) {
        const content = this.context.files[name];

        if (content === undefined) {
          throw new Error(`No content for ${name}.`);
        }

        return content;
      } else {
        return null;
      }
    },
    canSave: function (): boolean {
      const main = this.context.main;

      if (main === null || main.length > 100000) {
        return false;
      } else {
        return true;
      }
    },
    busy: function (): boolean {
      return this.context.busy;
    }
  },
  methods: {
    scrollToTop: function (): void {
      window.scrollTo(0, 0);
    }
  }
});

const enum FileType {
  Text = 'text',
  Binary = 'bin'
}
</script>
