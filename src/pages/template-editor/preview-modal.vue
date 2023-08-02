<template>
  <modal
    :context="context"
    title-class="text-truncate"
    body-class="position-static pb-0"
    footer-class="justify-content-between"
    v2
    @show="upload"
    @change="$emit('change', $event)"
    @hide="hiding"
    @hidden="reset">
    <!-- preview -->
    <template v-slot="{}">
      <b-tabs no-fade justified>
        <b-tab :title="$t('template-editor.label.preview-result')" class="py-3" active>
          <thumbnails-viewer v-if="thumbnails.length" content-id="preview-thumbnails" :thumbnails="thumbnails" style="height: 470px"></thumbnails-viewer>
          <p v-else class="mb-0" style="white-space: pre-wrap">{{ error }}</p>
        </b-tab>
        <b-tab :title="$t('template-editor.label.preview-source')" :disabled="!source" class="py-3" style="white-space: pre-wrap">{{ source }}</b-tab>
      </b-tabs>
    </template>
    <!-- loading -->
    <template #post-body="{}">
      <b-overlay :show="busy" opacity="1" no-wrap rounded no-fade></b-overlay>
    </template>
    <!-- footer -->
    <template #modal-footer="{ cancel }">
      <!-- options -->
      <b-dropdown :text="$t('template-editor.label.save-options')" :disabled="busy" dropup>
        <BDropdownItemButton @click="$emit('applicable-data')">
          {{ $t('template-editor.label.save-options-applicable-data') }}
        </BDropdownItemButton>
        <BDropdownDivider></BDropdownDivider>
        <BDropdownItemButton @click="$emit('preview-job')">
          {{ $t('template-editor.label.save-options-preview-job') }}
        </BDropdownItemButton>
        <BDropdownItemButton @click="$emit('experience-options')">
          {{ $t('template-editor.label.save-options-experience') }}
        </BDropdownItemButton>
        <BDropdownItemButton @click="$emit('education-options')">
          {{ $t('template-editor.label.save-options-education') }}
        </BDropdownItemButton>
        <BDropdownItemButton @click="$emit('skill-options')">
          {{ $t('template-editor.label.save-options-skill') }}
        </BDropdownItemButton>
      </b-dropdown>
      <div class="d-flex">
        <!-- publish -->
        <span id="publish-wrapper" class="d-inline-block" tabindex="0">
          <b-button class="mr-1" variant="danger" :disabled="!canPublish || busy || alerts.length > 0 || error.length > 0" @click="$emit('publish')">
            {{ $t('template-editor.label.save-publish') }}
          </b-button>
        </span>
        <!-- close -->
        <b-button class="ml-1" variant="primary" :disabled="busy" @click="cancel">
          {{ $t('template-editor.label.save-close') }}
        </b-button>
        <!-- tooltip -->
        <b-tooltip v-if="!canPublish" target="publish-wrapper">{{ $t('template-editor.message.paid-template-prerequisites') }}</b-tooltip>
      </div>
    </template>
  </modal>
</template>

<script lang="ts">
import { BButton, BDropdown, BDropdownDivider, BDropdownItemButton, BOverlay, BTab, BTabs, BTooltip, BvModalEvent } from 'bootstrap-vue';
import Vue from 'vue';
import { ReceivingMethodStatus } from '@/clients/payment-receiving-method';
import { RegistrationCategory, TemplateRegistrationService, WorkspaceBuildError } from '@/clients/template-registration';
import Modal from '@/components/modal';
import ThumbnailsViewer from '@/components/thumbnails-viewer';
import { AddAlert, AlertData, ErrorAlert, Source } from '@/store';
import { Uuid } from '@/util/uuid';
import { DirtyFlags, PageContext, SaveContext } from './models';

export default Vue.extend({
  components: { BButton, BDropdown, BDropdownDivider, BDropdownItemButton, BOverlay, BTab, BTabs, BTooltip, Modal, ThumbnailsViewer },
  model: {
    prop: 'context',
    event: 'change'
  },
  props: {
    regId: {
      type: Uuid,
      required: true
    },
    page: {
      type: PageContext,
      required: true
    },
    context: SaveContext
  },
  data: function () {
    return {
      alerts: new Array<AlertData>(),
      thumbnails: new Array<string>(),
      error: '',
      source: '',
      busy: true
    };
  },
  computed: {
    canPublish: function (): boolean {
      const r = this.page.registration;

      if (!r) {
        return false;
      } else if (r.category !== RegistrationCategory.Paid) {
        return true;
      }

      return r.prices.size > 0 && this.page.payments.some(p => p.status >= ReceivingMethodStatus.Ready);
    }
  },
  watch: {
    'page.applicableData': function () {
      if (this.context) {
        this.rebuild();
      }
    },
    'page.previewJob': function () {
      if (this.context) {
        this.rebuild();
      }
    },
    'page.options.experience': function () {
      if (this.context) {
        this.rebuild();
      }
    },
    'page.options.education': function () {
      if (this.context) {
        this.rebuild();
      }
    },
    'page.options.skill': function () {
      if (this.context) {
        this.rebuild();
      }
    }
  },
  destroyed: function () {
    this.freeThumbnails();
  },
  methods: {
    upload: async function (): Promise<void> {
      const service = new TemplateRegistrationService(this.$rest);

      // execute deletion
      for (const name of this.context.deletes) {
        try {
          await service.deleteWorkspaceAsset(this.regId, name);
        } catch (e) {
          const alert = new ErrorAlert(() => this.$t('template-editor.message.preview-delete-error', { name }), e as Error);

          this.alerts.push(alert);
          this.$store.commit(new AddAlert(Source.Server, alert));
          continue;
        }

        this.$emit('input', name);
      }

      // upload file
      for (const name of this.context.updates) {
        // get content
        let content = this.page.files[name];

        if (content === undefined) {
          throw new Error(`No content for file ${name}.`);
        }

        if (typeof content === 'string') {
          content = new Blob([content], { type: 'text/plain' });
        } else if (!(content instanceof Blob)) {
          throw new Error(`File ${name} has unknown content.`);
        }

        // upload
        let updated;

        try {
          updated = await service.writeWorkspaceAsset(this.regId, name, content as Blob);
        } catch (e) {
          const alert = new ErrorAlert(() => this.$t('template-editor.message.preview-upload-error', { name }), e as Error);

          this.alerts.push(alert);
          this.$store.commit(new AddAlert(Source.Server, alert));
          continue;
        }

        this.$emit('input', updated);
      }

      // update options
      if (this.page.dirty & DirtyFlags.ApplicableData) {
        let success = false;

        try {
          await service.writeWorkspaceApplicableData(this.regId, this.page.applicableData);
          success = true;
        } catch (e) {
          const alert = new ErrorAlert(() => this.$t('template-editor.message.preview-applicable-data-error'), e as Error);

          this.alerts.push(alert);
          this.$store.commit(new AddAlert(Source.Server, alert));
        }

        if (success) {
          this.$emit('input', this.page.dirty & ~DirtyFlags.ApplicableData);
        }
      }

      // rebuild preview
      await this.rebuild();
    },
    rebuild: async function (): Promise<void> {
      const service = new TemplateRegistrationService(this.$rest);

      // clear previous result
      this.freeThumbnails();
      this.alerts = [];
      this.thumbnails = [];
      this.error = '';
      this.source = '';

      // build
      let result;

      this.busy = true;

      try {
        result = await service.getWorkspacePreviews(this.regId, true);
      } catch (e) {
        const alert = new ErrorAlert(() => this.$t('template-editor.message.preview-rebuild-error'), e as Error);

        this.alerts.push(alert);
        this.$store.commit(new AddAlert(Source.Server, alert));
        this.busy = false;
        return;
      }

      if (result instanceof WorkspaceBuildError) {
        this.error = result.log;

        if (result.source) {
          // stringtemplate success but not latex
          this.source = result.source;
        }
      } else {
        // success
        const source = result.source ?? '';
        const thumbnails = new Array<string>();

        for (let i = 0; i < result.thumbnails.length; i++) {
          let thumbnail;

          try {
            thumbnail = await this.$rest.getFileURL(result.thumbnails[i]);
          } catch (e) {
            const alert = new ErrorAlert(() => this.$t('template-editor.message.preview-thumbnail-error', { page: i + 1 }), e as Error);

            this.alerts.push(alert);
            this.$store.commit(new AddAlert(Source.Server, alert));
            continue;
          }

          thumbnails.push(thumbnail);
        }

        this.freeThumbnails();
        this.thumbnails = thumbnails;
        this.source = source;
      }

      this.busy = false;
    },
    hiding: function (e: BvModalEvent): void {
      if (this.busy) {
        e.preventDefault();
      }
    },
    freeThumbnails: function (): void {
      for (const url of this.thumbnails) {
        URL.revokeObjectURL(url);
      }
    },
    reset: function (): void {
      this.freeThumbnails();
      this.alerts = [];
      this.thumbnails = [];
      this.error = '';
      this.source = '';
      this.busy = true;
    }
  }
});
</script>
