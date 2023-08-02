<template>
  <b-card no-body>
    <!-- header -->
    <b-card-header class="d-flex justify-content-between align-items-center">
      <data-title class="flex-grow-1 mr-2" :entry="entry" :index="index" :toggle-target="bodyId"></data-title>
      <data-action :resume="resume" :entry="entry" :index="index" @create="$emit('create')" @up="$emit('up')" @down="$emit('down')" @delete="$emit('delete')"></data-action>
    </b-card-header>
    <!-- content -->
    <b-collapse :id="bodyId" accordion="resume-data" v-model="expanded" v-slot="{}">
      <template v-if="entry.state">
        <component
          :is="getEditor(entry.type)"
          :id="`data-${entry.id}`"
          :type="entry.type"
          :lang="template.language"
          :state="entry.state"
          @result="$emit('result', $event)"
          @change="$emit('change', $event)"
          @dirty="$emit('dirty', $event)">
        </component>
        <data-footer
          :type="entry.type"
          :lang="template.language"
          :state="entry.state"
          @change="$emit('switch', $event)"
          @import="$emit('globalimport')">
        </data-footer>
      </template>
    </b-collapse>
  </b-card>
</template>

<script lang="ts">
import { BCard, BCardHeader, BCollapse } from 'bootstrap-vue';
import Vue, { Component } from 'vue';
import AddressEditor from '@/components/address-editor';
import CertificateEditor from '@/components/certificate-editor';
import { DataType } from '@/components/data-editor';
import EducationEditor from '@/components/education-editor';
import EmailEditor from '@/components/email-editor';
import ExperienceEditor from '@/components/experience-editor';
import GithubEditor from '@/components/github-editor';
import HeadlineEditor from '@/components/headline-editor';
import LanguageEditor from '@/components/language-editor';
import LinkedinEditor from '@/components/linkedin-editor';
import NameEditor from '@/components/name-editor';
import PhotoEditor from '@/components/photo-editor';
import SkillEditor from '@/components/skill-editor';
import SummaryEditor from '@/components/summary-editor';
import TelephoneEditor from '@/components/telephone-editor';
import WebsiteEditor from '@/components/website-editor';
import DataAction from './data-action.vue';
import DataFooter from './data-footer.vue';
import DataTitle from './data-title.vue';
import { DataEntry, Resume, Template } from './models';

export default Vue.extend({
  components: { BCard, BCardHeader, BCollapse, DataAction, DataFooter, DataTitle, ExperienceEditor, PhotoEditor },
  props: {
    resume: {
      type: Resume,
      required: true
    },
    template: {
      type: Template,
      required: true
    },
    entry: {
      type: DataEntry,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data: function () {
    return {
      expanded: false
    };
  },
  computed: {
    bodyId: function (): string {
      return `resume-data-${this.entry.id}`;
    }
  },
  watch: {
    'entry.state': function (n, o) {
      if (o === null) {
        this.expanded = true;
      }
    }
  },
  methods: {
    getEditor: function (type: string): Component {
      switch (type) {
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
          throw new Error(`No editor for '${type}'.`);
      }
    }
  }
});
</script>
