<template>
  <modal :context="context" body-class="position-static pb-0" v2 @show="populate" @change="$emit('change', $event)" @hide="hiding" @hidden="reset">
    <!-- form -->
    <template v-slot="{}">
      <b-form novalidate @submit="submit">
        <!-- paragraph -->
        <b-form-group
          :label="$t('template-editor.label.markdown-options-paragraph')"
          :description="$t('template-editor.message.markdown-options-paragraph')"
          :state="paragraphState"
          :invalid-feedback="$t('template-editor.message.markdown-options-invalid-paragraph')"
          label-for="markdown-paragraph">
          <b-form-input id="markdown-paragraph" :state="paragraphState" v-model="paragraph"></b-form-input>
        </b-form-group>
        <!-- list options -->
        <b-form-group
          :label="$t('template-editor.label.markdown-options-list-options')"
          :description="$t('template-editor.message.markdown-options-list-options')"
          :state="listOptionsState"
          :invalid-feedback="$t('template-editor.message.markdown-options-invalid-list-options')"
          label-for="markdown-listopts">
          <b-form-input id="markdown-listopts" :state="listOptionsState" v-model="listOptions"></b-form-input>
        </b-form-group>
      </b-form>
    </template>
    <!-- loading -->
    <template #post-body="{}">
      <b-overlay :show="busy" no-wrap no-fade rounded></b-overlay>
    </template>
    <!-- footer -->
    <template #modal-footer="{ cancel }">
      <b-button @click="cancel">{{ $t('template-editor.label.markdown-options-cancel') }}</b-button>
      <b-button variant="primary" :disabled="busy || !valid" @click="save">
        {{ $t('template-editor.label.markdown-options-save') }}
      </b-button>
    </template>
  </modal>
</template>

<script lang="ts">
import { BButton, BForm, BFormGroup, BFormInput, BOverlay, BvModalEvent } from 'bootstrap-vue';
import Vue from 'vue';
import Modal from '@/components/modal';
import { MarkdownContext, MarkdownResult } from './models';

export default Vue.extend({
  components: { BButton, BForm, BFormGroup, BFormInput, BOverlay, Modal },
  model: {
    prop: 'context',
    event: 'change'
  },
  props: {
    context: MarkdownContext
  },
  data: function () {
    return {
      paragraph: '',
      listOptions: '',
      success: false,
      busy: false
    };
  },
  computed: {
    paragraphState: function (): boolean | null {
      return this.paragraph.trim().length > 1000 ? false : null;
    },
    listOptionsState: function (): boolean | null {
      return this.listOptions.trim().length > 1000 ? false : null;
    },
    valid: function (): boolean {
      return this.paragraphState == null && this.listOptionsState == null;
    }
  },
  methods: {
    populate: function (): void {
      this.paragraph = this.context.src.descriptionParagraph ?? '';
      this.listOptions = this.context.src.descriptionListOptions ?? '';
    },
    submit: function (e: Event): void {
      e.preventDefault();

      if (this.valid && !this.busy) {
        this.save();
      }
    },
    save: async function (): Promise<void> {
      const result: MarkdownResult = {};
      const paragraph = this.paragraph.trim();
      const lisOptions = this.listOptions.trim();

      if (paragraph) {
        result.paragraph = paragraph;
      }

      if (lisOptions) {
        result.listOptions = lisOptions;
      }

      this.busy = true;
      this.success = await this.context.save(result);

      if (this.success) {
        this.$emit('change', null);
      } else {
        this.busy = false;
      }
    },
    hiding: function (e: BvModalEvent): void {
      if (this.busy && !this.success) {
        e.preventDefault();
      }
    },
    reset: function (): void {
      this.paragraph = '';
      this.listOptions = '';
      this.success = false;
      this.busy = false;
    }
  }
});
</script>
