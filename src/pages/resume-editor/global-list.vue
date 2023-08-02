<template>
  <b-table
    :fields="columns"
    :items="entries"
    :empty-text="emptyText"
    show-empty
    selectable
    select-mode="single"
    responsive
    @row-selected="rowSelected">
    <!-- column -->
    <template #head()="{ label }">
      <span style="white-space: nowrap;">{{ label }}</span>
    </template>
    <!-- cell -->
    <template #cell()="{ field, unformatted }">
      <property-viewer :type="type" :field="isSimple ? null : field.key" :value="unformatted"></property-viewer>
    </template>
  </b-table>
</template>

<script lang="ts">
import { BTable, BvTableFieldArray } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { TranslateResult } from 'vue-i18n';
import { ResumeService } from '@/clients/resume';
import { MultiplicableData, ResumeDataService } from '@/clients/resume-data';
import { TemplateService } from '@/clients/template';
import { TemplateRegistrationService } from '@/clients/template-registration';
import { getDataMetadata, PropertyType } from '@/components/data-editor';
import PropertyViewer from '@/components/property-viewer';
import { getCommonLanguage, getLanguageTree } from '@/i18n';
import { Source } from '@/store';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';
import { PageComponent } from './component';
import { ImportSource, FromGlobal, FromResume } from './models';

export default (Vue as VueConstructor<GlobalList>).extend({
  components: { BTable, PropertyViewer },
  mixins: [PageComponent],
  props: {
    resume: {
      type: String,
      required: true
    },
    lang: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      resumes: 0,
      entries: new Array<object>(),
      selected: null as object | null
    };
  },
  computed: {
    columns: function (): BvTableFieldArray {
      const m = getDataMetadata(this.type);
      const r: BvTableFieldArray = [];

      if (m.props) {
        for (const p of m.props) {
          if (p.type === PropertyType.Multiline) {
            continue;
          }

          r.push({
            key: p.name,
            label: p.label(this.$i18n) as string
          });
        }
      } else if (m.type !== undefined) {
        r.push({
          key: 'value',
          label: m.label(this.$i18n) as string
        });
      } else {
        throw new Error(`Don't know how to create column definitions for '${this.type}'.`);
      }

      return r;
    },
    emptyText: function (): TranslateResult {
      if (this.resumes) {
        return this.$t('global-import-list.message.placeholder');
      } else {
        return this.$t('global-import-list.message.no-resumes');
      }
    },
    isSimple: function (): boolean {
      return getDataMetadata(this.type).type !== undefined;
    }
  },
  beforeCreate: function () {
    this.$sources = new Map();
  },
  mounted: async function () {
    const globals = await this.loadGlobals();
    const langs = new Map<string, string>();
    const entries = new Array<object>();
    const tree = getLanguageTree(this.lang);
    const hasData = (common: string, tree: string[]): boolean => {
      for (let i = tree.indexOf(common) + 1; i < tree.length; i++) {
        if (globals.has(tree[i])) {
          return true;
        }
      }
      return false;
    };

    // populate from other languages
    for (const [lang, set] of globals) {
      if (tree.includes(lang)) {
        continue;
      }

      for (const v of set) {
        // skip if importing result is going to overwrite existing data
        if (v instanceof MultiplicableData) {
          if (v.base) {
            continue;
          }

          this.$sources.set(v, new FromGlobal(lang, v.id));
        } else {
          const common = getCommonLanguage(this.lang, lang);

          if (globals.has(common) || hasData(common, tree)) {
            continue;
          }

          const t = getLanguageTree(lang);

          t.pop(); // remove data that going to import otherwise hasData() will always return true

          if (hasData(common, t)) {
            continue;
          }

          this.$sources.set(v, new FromGlobal(lang, null));
        }

        entries.push(Object.freeze(v));
      }
    }

    // populate from other resumes
    // TODO: reduce stress on the server
    let resumes = 0;

    try {
      const service = new ResumeService(this.$rest);
      const ts = new TemplateService(this.$rest);
      const rs = new TemplateRegistrationService(this.$rest);

      for (const { id } of await service.list()) {
        if (id === this.resume) {
          continue;
        }

        resumes++;

        // get data and language
        const resume = await service.get(new Uuid(id));
        let i = 0;
        let lang = langs.get(resume.template);

        if (lang === undefined) {
          const t = await ts.get(new ULID(resume.template));
          const r = await rs.get(t.registrationId);

          langs.set(resume.template, lang = r.language);
        }

        for (const { type, value } of resume.data) {
          if (type !== this.type) {
            continue;
          }

          // skip if importing result is going to overwrite existing data
          if (value instanceof MultiplicableData) {
            if (value.base !== null) {
              i++;
              continue;
            }

            this.$sources.set(value, new FromResume(new Uuid(id), i++));
          } else {
            const common = getCommonLanguage(this.lang, lang);

            if (globals.has(common) || hasData(common, getLanguageTree(lang)) || hasData(common, tree)) {
              continue;
            }

            this.$sources.set(value, new FromResume(new Uuid(id), null));
          }

          entries.push(Object.freeze(value));
        }
      }
    } catch (e) {
      // TODO: display alert
      return;
    } finally {
      this.$emit('ready');
    }

    this.resumes = resumes;
    this.entries = entries;
  },
  methods: {
    loadGlobals: async function (): Promise<Map<string, object[]>> {
      const service = new ResumeDataService(this.$rest);
      const entries = new Map<string, object[]>();

      try {
        for (const { culture, data } of await service.all()) {
          if (data.type !== this.type) {
            continue;
          }

          let set = entries.get(culture);

          if (!set) {
            entries.set(culture, set = []);
          }

          set.push(data.value);
        }
      } catch (e) {
        const error = e as Error;
        this.$error(Source.Server, () => this.$t('resume-editor.message.fetch-global-data-error', { error }), error);
        entries.clear();
      }

      return entries;
    },
    rowSelected: function (items: object[]): void {
      this.selected = items.length ? items[0] : null;
    },
    createResult: function (): ImportSource {
      if (this.selected === null) {
        throw new Error('No any selected rows.');
      }

      const source = this.$sources.get(this.selected);

      if (source === undefined) {
        throw new Error(`Unknow source for ${this.selected}.`);
      }

      return new ImportSource(source as any, this.selected);
    }
  },
  watch: {
    'selected': {
      immediate: true,
      handler: function (n) {
        this.$emit('change', n === null ? null : this.createResult);
      }
    }
  }
});

interface GlobalList extends PageComponent {
  $sources: Map<object, unknown>;
}
</script>
