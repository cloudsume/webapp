<template>
  <div class="d-flex flex-column preview-pane">
    <!-- resume name -->
    <div class="d-flex justify-content-between align-items-center">
      <h3>{{ resume ? resume.name : $t('untitled-resume.label.header') }}</h3>
      <b-dropdown :disabled="disabled" variant="link" toggle-class="p-0" no-caret right>
        <b-dropdown-item-button :disabled="disabled" @click="setManageLinks">
          {{ $t('share-resume.label.menu-item') }}
        </b-dropdown-item-button>
        <BDropdownDivider></BDropdownDivider>
        <BDropdownItemButton :disabled="disabled" @click="renaming = true">
          {{ $t('resume-editor.label.rename-resume') }}
        </BDropdownItemButton>
        <BDropdownItemButton :disabled="disabled" @click="changingTemplate = true">
          {{ $t('resume-editor.label.change-template') }}
        </BDropdownItemButton>
        <BDropdownDivider></BDropdownDivider>
        <b-dropdown-item-button :disabled="disabled" @click="setDownload">
          {{ $t('download-resume.label.menu-item') }}
        </b-dropdown-item-button>
        <template #button-content>
          <b-icon icon="three-dots-vertical"></b-icon>
        </template>
      </b-dropdown>
    </div>
    <!-- thumbnails -->
    <b-overlay :show="context.saving" rounded="sm" class="flex-grow-1 mb-3" style="min-height: 0px">
      <thumbnails-viewer content-id="resume-thumbnails" :thumbnails="resume ? resume.thumbnails : []" class="h-100"></thumbnails-viewer>
    </b-overlay>
    <!-- modals -->
    <LinksManager v-if="managingLinks"
      :resume="managingLinks"
      @create="$emit('link-created', $event)"
      @delete="$emit('link-deleted', $event)"
      @hidden="managingLinks = null">
    </LinksManager>
    <RenameResume v-if="renaming" :resume-id="resumeId" :current="resume.name" @hidden="renamed"></RenameResume>
    <ChangeTemplate v-if="changingTemplate" :resume="resume" :current="template" @hidden="templateChanged"></ChangeTemplate>
    <template v-if="downloading">
      <downloader v-if="canDownload" :resume="downloading" @recruitment-consent="recruitmentConsentUpdated" @hidden="downloading = null"></downloader>
      <purchase-template v-else :resume="downloading" :return-url="pageURL" @hidden="downloading = null">
        <p>{{ $t('resume-editor.message.unsaved-data-warning') }}</p>
      </purchase-template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/bootstrap';

$preview-top: add($navbar-height, map-get($spacers, 3));
$preview-height: calc(100vh - #{$preview-top});

.preview-pane {
  position: sticky;
  top: $preview-top;
  height: calc(#{$preview-height} - 20px);
}

@include media-breakpoint-up(lg) {
  .preview-pane {
    height: $preview-height;
  }
}
</style>

<script lang="ts">
import { BDropdownDivider, BDropdownItemButton } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { ResumeInfo } from '@/clients/resume';
import { RegistrationCategory, TemplateLicenseStatus } from '@/clients/template-registration';
import LinksManager from '@/components/links-manager';
import PurchaseTemplate from '@/components/purchase-template';
import RenameResume from '@/components/rename-resume';
import Downloader from '@/components/resume-downloader';
import ThumbnailsViewer from '@/components/thumbnails-viewer';
import { ULID } from '@/util/ulid';
import { NilUUID, Uuid } from '@/util/uuid';
import ChangeTemplate from './change-template.vue';
import { PageComponent } from './component';
import { Resume, Template } from './models';

export default (Vue as VueConstructor<PageComponent>).extend({
  components: { BDropdownDivider, BDropdownItemButton, ChangeTemplate, Downloader, LinksManager, PurchaseTemplate, RenameResume, ThumbnailsViewer },
  mixins: [PageComponent],
  props: {
    resume: Resume,
    template: Template
  },
  data: function () {
    return {
      managingLinks: null as ResumeInfo | null,
      renaming: false,
      changingTemplate: false,
      downloading: null as ResumeInfo | null
    }
  },
  computed: {
    resumeId: function (): Uuid {
      if (this.resume) {
        return new Uuid(this.resume.id);
      } else {
        return NilUUID;
      }
    },
    disabled: function (): boolean {
      return !this.resume || this.context.saving;
    },
    canDownload: function (): boolean {
      const t = this.template;
      const s = this.$store.state.session;

      if (!t || t.category !== RegistrationCategory.Paid) {
        return true;
      } else if (t.user.equals(s.userId) || t.license?.status === TemplateLicenseStatus.Valid) {
        return true;
      }

      return false;
    },
    pageURL: function (): string {
      return process.env.BASE_URI + this.$route.path;
    }
  },
  methods: {
    renamed: function (result: string | null): void {
      if (result !== null) {
        this.$emit('name-updated', result);
      }

      this.renaming = false;
    },
    templateChanged: function (id: ULID | null): void {
      this.changingTemplate = false;

      if (id) {
        this.$nextTick(function () {
          this.$emit('template-updated');
        });
      }
    },
    setManageLinks: function (): void {
      this.managingLinks = new ResumeInfo(
        this.resume.id,
        this.resume.name,
        this.resume.template.toString(),
        this.resume.links,
        this.resume.recruitmentConsent,
        this.resume.createdAt);
    },
    setDownload: function (): void {
      this.downloading = new ResumeInfo(
        this.resume.id,
        this.resume.name,
        this.resume.template.toString(),
        this.resume.links,
        this.resume.recruitmentConsent,
        this.resume.createdAt);
    },
    recruitmentConsentUpdated: function (v: boolean): void {
      this.$emit('recruitment-consent', v);
    }
  }
});
</script>
