<template>
  <b-list-group-item class="flex-column align-items-start">
    <!-- header -->
    <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1">{{ name }}</h5>
      <b-form-checkbox :checked="value" @change="$emit('input', $event)">
        {{ $t('template-editor.label.type-item-enabled') }}
      </b-form-checkbox>
    </div>
    <!-- description -->
    <p class="text-muted mb-1">{{ description }}</p>
    <!-- up/down -->
    <div class="d-flex">
      <b-button :disabled="!value" size="sm" class="flex-grow-1 mr-1" @click="$emit('up')">
        <b-icon icon="chevron-up"></b-icon>
      </b-button>
      <b-button :disabled="!value" size="sm" class="flex-grow-1 ml-1" @click="$emit('down')">
        <b-icon icon="chevron-down"></b-icon>
      </b-button>
    </div>
  </b-list-group-item>
</template>

<script lang="ts">
import { BButton, BFormCheckbox, BIcon, BIconChevronDown, BIconChevronUp, BListGroupItem } from 'bootstrap-vue';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { DataType, getDataMetadata } from '@/components/data-editor';

export default Vue.extend({
  components: { BButton, BFormCheckbox, BIcon, BIconChevronDown, BIconChevronUp, BListGroupItem },
  props: {
    type: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    name: function (): TranslateResult {
      return getDataMetadata(this.type).label(this.$i18n);
    },
    description: function (): TranslateResult {
      switch (this.type) {
        case DataType.Name:
          return this.$t('template-editor.message.name-description');
        case DataType.Headline:
          return this.$t('template-editor.message.headline-description');
        case DataType.Address:
          return this.$t('template-editor.message.address-description');
        case DataType.Mobile:
          return this.$t('template-editor.message.mobile-description');
        case DataType.Email:
          return this.$t('template-editor.message.email-description');
        case DataType.LinkedIn:
          return this.$t('template-editor.message.linkedin-description');
        case DataType.GitHub:
          return this.$t('template-editor.message.github-description');
        case DataType.Website:
          return this.$t('template-editor.message.website-description');
        case DataType.Photo:
          return this.$t('template-editor.message.photo-description');
        case DataType.Summary:
          return this.$t('template-editor.message.summary-description');
        case DataType.Experience:
          return this.$t('template-editor.message.experience-description');
        case DataType.Education:
          return this.$t('template-editor.message.education-description');
        case DataType.Certificate:
          return this.$t('template-editor.message.certificate-description');
        case DataType.Skill:
          return this.$t('template-editor.message.skill-description');
        case DataType.Language:
          return this.$t('template-editor.message.language-description');
        default:
          throw new Error(`Unknow data type ${this.type}.`);
      }
    }
  }
});
</script>
