<template>
  <modal :title="title" :ok-disabled="!valid" v3 @ok="ok" @hidden="$emit('hidden')" v-slot="{ ok }">
    <b-tabs content-class="mt-2" justified no-fade>
      <!-- input -->
      <b-tab :title="$t('account-templates.label.update-description-edit-tab')">
        <b-form novalidate @submit.prevent="ok">
          <b-form-textarea rows="20" :state="valueState" v-model="value"></b-form-textarea>
        </b-form>
      </b-tab>
      <!-- preview -->
      <b-tab :title="$t('account-templates.label.update-description-preview-tab')" lazy v-slot="{}">
        <markdown-viewer id="update-template-description-preview" :data="value"></markdown-viewer>
      </b-tab>
    </b-tabs>
  </modal>
</template>

<script lang="ts">
import { BForm, BFormTextarea, BTab, BTabs } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { TemplateRegistrationService } from '@/clients/template-registration';
import MarkdownViewer from '@/components/markdown-viewer';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { Source } from '@/store';
import { PageComponent } from './component';
import { Template } from './models';

export default (Vue as VueConstructor<PageComponent>).extend({
  components: { BForm, BFormTextarea, BTab, BTabs, MarkdownViewer, Modal },
  mixins: [PageComponent],
  props: {
    template: {
      type: Template,
      required: true
    }
  },
  data: function () {
    return {
      value: this.template.description
    };
  },
  computed: {
    title: function (): string {
      return this.template.name;
    },
    valueState: function (): boolean | null {
      return this.value.length <= 10000 ? null : false;
    },
    valid: function (): boolean {
      return this.valueState === null;
    }
  },
  methods: {
    ok: async function (proceed: Proceed, busy: ToggleBusy): Promise<void> {
      if (!this.valid) {
        return;
      }

      const service = new TemplateRegistrationService(this.$rest);

      busy(true);

      try {
        await service.setDescription(this.template.id, this.value ? this.value : null);
      } catch (e) {
        const error = e as Error;
        this.$error(Source.Server, () => this.$t('account-templates.message.update-description-error', { error: error.message }), error);
        busy(false);
        return;
      }

      proceed();

      this.$emit('input', this.value);
    }
  }
});
</script>
