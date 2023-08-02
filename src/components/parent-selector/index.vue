<template>
  <b-overlay :show="busy" opacity="1" rounded="sm" spinner-small no-fade>
    <b-form-select :disabled="context.saving" :options="availables.value" :value="value" @change="change">
      <template #first>
        <b-form-select-option :value="null">{{ $t('parent-selector.label.no-parent') }}</b-form-select-option>
      </template>
    </b-form-select>
  </b-overlay>
</template>

<script lang="ts">
import { BFormSelect, BFormSelectOption, BOverlay } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { TelephoneNumber } from '@/clients/rest';
import {
  DataProperty,
  MultiplicableData,
  ResumeAddress,
  ResumeCertificate,
  ResumeEducation,
  ResumeExperience,
  ResumeLanguage,
  ResumeName,
  ResumeSkill
} from '@/clients/resume-data';
import { ContextKey, DataState, DataType } from '@/components/data-editor';
import { getLanguageName, getParentLanguage } from '@/i18n';
import {
  formatAddress,
  formatCertificate,
  formatEducation,
  formatExperience,
  formatLanguage,
  formatName,
  formatSkill,
  formatString,
  formatTelephone
} from '@/resume-data';
import { future, FutureData } from '@/util/vue-future';
import { DataMerger, EditingContext, ParentData } from './models';

export default (Vue as VueConstructor<ParentSelector>).extend({
  components: { BFormSelect, BFormSelectOption, BOverlay },
  inject: {
    context: ContextKey as symbol
  },
  props: {
    type: {
      type: String,
      required: true
    },
    lang: {
      type: String,
      required: true
    },
    state: {
      type: DataState,
      required: true
    }
  },
  computed: {
    value: function (): string | null {
      if (this.busy) {
        return null;
      }

      const p = this.state.parent as ParentData | null;

      if (p === null) {
        return null;
      } else if (p.value instanceof MultiplicableData) {
        return p.value.id.toString();
      } else {
        return '';
      }
    },
    availables: function (): FutureData<ParentItem[]> {
      return future([], async () => {
        const locale = this.$store.state.locale;
        const parent = getParentLanguage(this.lang);
        const globals = this.context.globals[this.type];

        if (!globals) {
          return [];
        }

        const items = new Array<ParentItem>();

        for (const { value } of globals[this.lang] ?? []) {
          items.push({
            text: await this.format(value, parent),
            value: value instanceof MultiplicableData ? value.id.toString() : ''
          });
        }

        return items.sort((a, b) => a.text.localeCompare(b.text, locale));
      });
    },
    busy: function (): boolean {
      return this.availables.pending;
    }
  },
  watch: {
    'busy': {
      immediate: true,
      handler: function (n) {
        this.$emit('busy', n);
      }
    }
  },
  methods: {
    change: function (v: string | null): void {
      // if this event has been raised that mean we have global data for sure
      const g = this.context.globals[this.type][this.lang];
      let r;

      if (v === null) {
        r = null;
      } else if (v === '') {
        r = new ParentData(this.type, this.lang, g[0].value);
      } else {
        for (const { value } of g) {
          if ((value as MultiplicableData).id.toString() === v) {
            r = new ParentData(this.type, this.lang, value);
            break;
          }
        }
      }

      this.$emit('change', r);
    },
    format: async function (data: object, parent: string | null): Promise<string> {
      const merger = new DataMerger(data, parent, this.context.globals[this.type]);
      const locale = this.$store.state.locale as string;

      switch (this.type) {
        case DataType.Name:
          return formatName(merger as DataMerger<ResumeName>, locale);
        case DataType.Address:
          return formatAddress(merger as DataMerger<ResumeAddress>, locale);
        case DataType.Mobile:
          return formatTelephone(merger as DataMerger<DataProperty<TelephoneNumber>>, locale);
        case DataType.Photo:
          return this.formatPhoto(merger as DataMerger<DataProperty<string>>, locale);
        case DataType.Summary:
          return this.formatSummary(merger as DataMerger<DataProperty<string>>, locale);
        case DataType.Experience:
          return formatExperience(merger as DataMerger<ResumeExperience>);
        case DataType.Education:
          return formatEducation(merger as DataMerger<ResumeEducation>);
        case DataType.Certificate:
          return formatCertificate(merger as DataMerger<ResumeCertificate>);
        case DataType.Skill:
          return formatSkill(merger as DataMerger<ResumeSkill>, this.$i18n);
        case DataType.Language:
          return formatLanguage(merger as DataMerger<ResumeLanguage>, locale, this.$i18n);
        case DataType.Headline:
        case DataType.Email:
        case DataType.LinkedIn:
        case DataType.GitHub:
        case DataType.Website:
          return formatString(merger as DataMerger<DataProperty<string>>);
        default:
          throw new Error(`Don't know how to format '${this.type}'.`);
      }
    },
    formatPhoto: function (m: DataMerger<DataProperty<string>>, l: string): string {
      const v = m.for(d => d, (v, l) => l === null);

      if (v === null) {
        // no parent
        return this.$t('parent-selector.label.no-photo') as string;
      } else if (v) {
        // value is current data
        if (this.lang) {
          return getLanguageName(this.lang, l);
        } else {
          return this.$t('parent-selector.label.default-photo') as string;
        }
      } else {
        // value is a parent (or grandparent) of "data"
        const v = getParentLanguage(this.lang);

        if (v === null) {
          // this should never happen becuase this.lang is never invariant
          throw new Error('Unexpected parent language.');
        }

        return getLanguageName(v, l);
      }
    },
    formatSummary: function (m: DataMerger<DataProperty<string>>, l: string): string {
      const v = m.for(d => d, (v, l) => l === null);

      if (v === null) {
        // no parent
        return this.$t('parent-selector.label.no-summary') as string;
      } else if (v) {
        // value is current data
        if (this.lang) {
          return getLanguageName(this.lang, l);
        } else {
          return this.$t('parent-selector.label.default-summary') as string;
        }
      } else {
        // value is a parent (or grandparent) of "data"
        const v = getParentLanguage(this.lang);

        if (v === null) {
          // this should never happen becuase this.lang is never invariant
          throw new Error('Unexpected parent language.');
        }

        return getLanguageName(v, l);
      }
    }
  }
});

interface ParentSelector extends Vue {
  context: EditingContext;
}

interface ParentItem {
  text: string;
  value: string;
}
</script>
