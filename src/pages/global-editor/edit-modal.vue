<template>
  <Modal v3 @ok="save" @hidden="hidden">
    <!-- title -->
    <template #modal-title="{}">
      {{ typeLabel }}
      <small class="text-muted">{{ localeLabel }}</small>
    </template>
    <!-- editor -->
    <template #default="{ ok }">
      <b-form novalidate @submit.prevent="ok()">
        <component
          :is="getEditor()"
          :id="`global-${type}-editor`"
          :type="type"
          :lang="locale"
          :state="state"
          class="p-0"
          @result="updateResult"
          @change="updateFlags"
          @dirty="setDirty">
        </component>
      </b-form>
    </template>
    <!-- footer -->
    <template #modal-footer="{ ok }">
      <parent-selector v-if="locale"
        :type="type"
        :lang="parent"
        :state="state"
        class="flex-grow-1"
        @change="updateParent">
      </parent-selector>
      <b-button :disabled="!canSave" variant="primary" @click="ok()">
        {{ $t('global-editor.label.save') }}
      </b-button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { toJSON } from '@ultimicro/json-mapper';
import { BButton, BForm } from 'bootstrap-vue';
import Vue, { Component, VueConstructor } from 'vue';
import { MultiplicableData, ResumeData, ResumeDataService } from '@/clients/resume-data';
import AddressEditor from '@/components/address-editor';
import CertificateEditor from '@/components/certificate-editor';
import { DataFlags, DataState, DataType, findParent, getDataMetadata, ResultFactory, UpdateWriter } from '@/components/data-editor';
import EducationEditor from '@/components/education-editor';
import EmailEditor from '@/components/email-editor';
import ExperienceEditor from '@/components/experience-editor';
import GithubEditor from '@/components/github-editor';
import HeadlineEditor from '@/components/headline-editor';
import LanguageEditor from '@/components/language-editor';
import LinkedinEditor from '@/components/linkedin-editor';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import NameEditor from '@/components/name-editor';
import ParentSelector, { ParentData } from '@/components/parent-selector';
import PhotoEditor from '@/components/photo-editor';
import SkillEditor from '@/components/skill-editor';
import SummaryEditor from '@/components/summary-editor';
import TelephoneEditor from '@/components/telephone-editor';
import WebsiteEditor from '@/components/website-editor';
import { getLanguageName, getParentLanguage } from '@/i18n';
import { Uuid } from '@/util/uuid';
import { PageComponent } from './component';
import { EditingData, SimpleData } from './models';

export default (Vue as VueConstructor<PageComponent>).extend({
  components: { BButton, BForm, Modal, ParentSelector },
  mixins: [PageComponent],
  props: {
    data: {
      type: EditingData,
      required: true
    }
  },
  data: function () {
    const parentLocale = getParentLanguage(this.data.locale);
    const type = this.context.type;

    if (type === null) {
      throw new Error('No type has been selected.');
    }

    // Unpack data.
    let data = this.data.data;

    if (data instanceof SimpleData) {
      data = data.value;
    }

    // Get parent data.
    const parent = parentLocale === null ? null : findParent(this.context.globals[type], data, parentLocale);

    return {
      state: new DataState(data, parent ? new ParentData(type, parentLocale!, parent.value) : null)
    };
  },
  computed: {
    type: function (): string {
      const v = this.context.type;

      if (v === null) {
        throw new Error('No type has been selected.');
      } else {
        return v;
      }
    },
    locale: function (): string {
      return this.data.locale;
    },
    parent: function (): string {
      const l = getParentLanguage(this.locale);

      if (l === null) {
        throw new Error('No parent available.');
      }

      return l;
    },
    typeLabel: function (): string {
      return getDataMetadata(this.type).label(this.$i18n) as string;
    },
    localeLabel: function (): string {
      const locale = this.$store.state.locale;

      return this.locale ? getLanguageName(this.locale, locale) : this.$t('global-editor.label.default-language') as string;
    },
    canSave: function (): boolean {
      const s = this.state;

      if (s.flags & DataFlags.Error) {
        return false;
      }

      // TODO: allow saving if parent changed
      return s.dirty;
    }
  },
  methods: {
    getEditor: function (): Component {
      switch (this.type) {
        case DataType.Name:
          return NameEditor;
        case DataType.Headline:
          return HeadlineEditor;
        case DataType.Address:
          return AddressEditor;
        case DataType.Mobile:
          return TelephoneEditor;
        case DataType.Email:
          return EmailEditor;
        case DataType.LinkedIn:
          return LinkedinEditor;
        case DataType.GitHub:
          return GithubEditor;
        case DataType.Website:
          return WebsiteEditor;
        case DataType.Photo:
          return PhotoEditor;
        case DataType.Summary:
          return SummaryEditor;
        case DataType.Experience:
          return ExperienceEditor;
        case DataType.Education:
          return EducationEditor;
        case DataType.Certificate:
          return CertificateEditor;
        case DataType.Skill:
          return SkillEditor;
        case DataType.Language:
          return LanguageEditor;
        default:
          throw new Error(`Unknow data '${this.type}'.`);
      }
    },
    updateResult: function (v: ResultFactory | null): void {
      this.state.result = v;
    },
    updateFlags: function (v: DataFlags): void {
      this.state.flags = v;
    },
    setDirty: function (v: boolean): void {
      this.state.dirty = v;
    },
    updateParent: function (v: ParentData | null): void {
      this.state.parent = v;
    },
    save: async function (proceed: Proceed, busy: ToggleBusy): Promise<void> {
      if (!this.canSave) {
        return;
      }

      // prepare request
      const state = this.state;

      if (!state.result) {
        throw new Error('No result to submit.');
      }

      const type = this.type;
      const update = new FormData();
      const writer = new class extends UpdateWriter {
        getParent(): Uuid | null {
          const parent = state.parent as ParentData | null;

          if (parent instanceof MultiplicableData) {
            return parent.id;
          } else {
            return null;
          }
        }

        writeUpdate(data: object): void {
          update.append(`update:${type}`, new Blob([toJSON(data)], { type: 'application/json' }));
        }

        writeContent(id: string, value: string | Blob): void {
          update.append(`content:${id}`, value);
        }
      };

      state.result(writer);

      // submit
      const service = new ResumeDataService(this.$rest);
      let res;

      this.context.saving = true;
      busy(true);

      try {
        res = await service.patch(this.locale ? this.locale : 'default', update);
      } catch (e) {
        // TODO: display alert
        busy(false);
        return;
      } finally {
        this.context.saving = false;
      }

      if (res.updatedData.length !== 1) {
        busy(false);
        throw new Error('Unexpected update response.');
      }

      proceed(res.updatedData[0]);
    },
    hidden: function (result: ResumeData | undefined): void {
      if (result !== undefined) {
        this.$emit('saved', result);
      }

      this.$emit('hidden');
    }
  }
});
</script>
