<template>
  <page class="flex-grow-1 d-flex flex-column">
    <b-row v-if="types.length" class="flex-grow-1">
      <!-- type list -->
      <b-col cols="12" md="4" lg="3">
        <b-list-group class="mb-3">
          <b-list-group-item v-for="t of types" :key="t.name"
            :active="t.name === type"
            class="d-flex justify-content-between align-items-center"
            button
            @click="updateType(t.name)">
            {{ typeLabel(t.name) }}
            <b-badge :variant="t.name === type ? 'light' : 'primary'" pill>{{ t.count }}</b-badge>
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <!-- data list -->
      <b-col cols="12" md="8" lg="9" class="right-pane" ref="list">
        <div v-if="type === null" class="h-100 d-flex justify-content-center align-items-center">
          <p class="lead">{{ $t('global-editor.message.no-type-selected') }}</p>
        </div>
        <div v-else class="table-container">
          <b-table :key="type" :fields="columns" :items="items" primary-key="$key" class="mb-md-0" stacked striped borderless>
            <!-- lang -->
            <template #cell(lang)="{ item }">
              <span class="text-muted">{{ getLanguageName(item) }}</span>
            </template>
            <!-- data cell -->
            <template #cell()="{ field, item }">
              <value-viewer :type="type" :object="item" :property="field.key" :lang="getLanguage(item)"></value-viewer>
            </template>
            <!-- actions -->
            <template #cell(actions)="{ item }">
              <b-button variant="link" class="p-0" @click="editRow(item)">{{ $t('global-editor.label.edit-action') }}</b-button>
            </template>
          </b-table>
          <div class="d-flex justify-content-end d-md-none">
            <b-button variant="link" class="p-0" @click="scrollToTop">{{ $t('global-editor.label.go-to-top') }}</b-button>
          </div>
        </div>
      </b-col>
    </b-row>
    <div v-else class="flex-grow-1 d-flex align-items-center justify-content-center">
      <p class="lead">{{ $t('global-editor.message.no-globals') }}</p>
    </div>
    <!-- modals -->
    <EditModal v-if="editing" :data="editing" @saved="rowUpdated" @hidden="editing = null"></EditModal>
  </page>
</template>

<style lang="scss" scoped>
@import '~@/styles/bootstrap';

// fix scrollIntoView
.right-pane {
  padding-top: $navbar-height;
  margin-top: -$navbar-height;
}

.table-container {
  margin-bottom: map-get($spacers, 3);
}

@include media-breakpoint-up(md) {
  // reverse fixes so scrollbar will not overlap navigation bar
  .right-pane {
    padding-top: 0;
    margin-top: 0;
  }

  .table-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: auto;
  }
}
</style>

<script lang="ts">
import { BBadge, BButton, BCol, BListGroup, BListGroupItem, BRow, BTable, BvTableFieldArray } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { ResumeService } from '@/clients/resume';
import { DataProperty, MultiplicableData, ResumeData, ResumeDataService } from '@/clients/resume-data';
import { TemplateService } from '@/clients/template';
import { TemplateRegistrationService } from '@/clients/template-registration';
import { AvailableTypes, ContextKey, DataTable, getDataMetadata } from '@/components/data-editor';
import { getLanguageName, getParentLanguage } from '@/i18n';
import Page from '@/components/page';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';
import EditModal from './edit-modal.vue';
import { Context, EditingData, SimpleData } from './models';
import ValueViewer from './value-viewer.vue';

export default (Vue as VueConstructor<GlobalEditor>).extend({
  components: { BBadge, BButton, BCol, BListGroup, BListGroupItem, BRow, BTable, EditModal, Page, ValueViewer },
  data: function () {
    return {
      context: new Context(this.$i18n),
      editing: null as EditingData | null,
    };
  },
  computed: {
    type: function (): string | null {
      return this.context.type;
    },
    types: function (): TypeInfo[] {
      const types = new Array<TypeInfo>();

      for (const type of AvailableTypes) {
        const table = this.context.globals[type];

        if (table) {
          types.push({ name: type, count: Object.values(table).reduce((n, s) => n + s.length, 0) });
        }
      }

      return types;
    },
    columns: function (): BvTableFieldArray {
      if (this.type === null) {
        throw new Error('No type has been selected.');
      }

      const m = getDataMetadata(this.type);
      const r: BvTableFieldArray = [
        {
          key: 'lang',
          label: this.$t('global-editor.label.data-language') as string
        }
      ];

      if (m.props) {
        for (const p of m.props) {
          r.push({ key: p.name, label: p.label(this.$i18n) as string });
        }
      } else if (m.type !== undefined) {
        r.push({ key: 'value', label: m.label(this.$i18n) as string });
      } else {
        throw new Error(`Don't know how to create columns for '${this.type}'.`);
      }

      r.push({ key: 'actions', label: this.$t('global-editor.label.actions') as string });

      return r;
    },
    items: function (): unknown[] {
      this.$languages.clear();

      if (this.type === null) {
        return [];
      }

      const table = this.context.globals[this.type];
      const items = new Array<unknown>();

      for (const lang of Object.keys(table).sort()) {
        for (const { value } of table[lang]) {
          const setKey = (row: object, value: unknown) => Object.defineProperty(row, '$key', { value });
          let data;

          if (value instanceof DataProperty) {
            data = new SimpleData(value);
            setKey(data, getRowKey(this.type, lang));
          } else if (value.hasOwnProperty('$key')) {
            data = value;
          } else {
            data = value;

            if (data instanceof MultiplicableData) {
              setKey(data, getRowKey(this.type, lang, data.id));
            } else {
              setKey(data, getRowKey(this.type, lang));
            }
          }

          items.push(data);
          this.$languages.set(data, lang);
        }
      }

      return items;
    },
    isSimple: function (): boolean {
      if (this.type === null) {
        throw new Error('No type selected.');
      }

      return getDataMetadata(this.type).type !== undefined;
    }
  },
  provide: function (): object {
    return { [ContextKey as symbol]: this.context };
  },
  fetch: async function (): Promise<void> {
    const service = new ResumeService(this.$rest);

    // get languages of all resumes
    let resumes;

    try {
      resumes = await service.list();
    } catch (e) {
      // TODO: display alert
      return;
    }

    const langs = new Map<string, string>();

    try {
      const ts = new TemplateService(this.$rest);
      const rs = new TemplateRegistrationService(this.$rest);

      for (const r of resumes) {
        if (langs.has(r.template)) {
          continue;
        }

        // TODO: cache registration
        const t = await ts.get(new ULID(r.template));
        const tr = await rs.get(t.registrationId);

        langs.set(r.template, tr.language);
      }
    } catch (e) {
      // TODO: display alert
      return;
    }

    // fetch all data without triggering reactivity
    const ds = new ResumeDataService(this.$rest);
    const completed = new Set<string>();
    const globals = new Array<{ lang: string, list: ResumeData[] }>();

    for (const [_, lang] of langs) {
      for (let current: string | null = lang; current !== null; current = getParentLanguage(current)) {
        if (completed.has(current)) {
          continue;
        }

        let list;

        try {
          list = await ds.list(current || 'default');
        } catch (e) {
          // TODO: display alert
          return;
        }

        globals.push({ lang: current, list });
        completed.add(current);
      }
    }

    // populate global table
    for (const { lang, list } of globals) {
      for (const data of list) {
        let table = this.context.globals[data.type];

        if (!table) {
          Vue.set(this.context.globals, data.type, table = new DataTable());
        }

        let set = table[lang];

        if (!set) {
          Vue.set(table, lang, set = []);
        }

        set.push(Object.freeze(data));
      }
    }
  },
  beforeCreate: function () {
    this.$languages = new Map();
  },
  methods: {
    typeLabel: function (type: string): string {
      return getDataMetadata(type).label(this.$i18n) as string;
    },
    updateType: function (v: string): void {
      this.context.type = v;

      if (!(this.$refs.list instanceof Element)) {
        throw new Error(`Unexpected reference to 'list': ${this.$refs.list}.`);
      }

      this.$refs.list.scrollIntoView();
    },
    getLanguageName: function (row: object): string {
      const tag = this.getLanguage(row);

      if (tag) {
        return getLanguageName(tag, this.$store.state.locale);
      } else {
        return this.$t('global-editor.label.default-language') as string;
      }
    },
    getLanguage: function (row: object): string {
      const tag = this.$languages.get(row);

      if (tag === undefined) {
        throw new Error(`Unknow row '${row}'.`);
      }

      return tag;
    },
    scrollToTop: function (): void {
      window.scrollTo(0, 0);
    },
    editRow: function (row: object): void {
      this.editing = new EditingData(row, this.getLanguage(row));
    },
    rowUpdated: function (updated: ResumeData): void {
      const c = this.editing;

      if (c === null) {
        throw new Error('No modal to update');
      }

      const s = this.context.globals[updated.type][c.locale];

      if (updated.value instanceof MultiplicableData) {
        for (let i = 0; i < s.length; i++) {
          if ((s[i].value as MultiplicableData).id.equals(updated.value.id)) {
            this.$set(s, i, Object.freeze(updated));
            return;
          }
        }

        throw new Error('Cannot find the data to replace.');
      } else {
        this.$set(s, 0, Object.freeze(updated));
      }
    }
  }
});

function getRowKey(type: string, lang: string, id?: Uuid): string {
  if (id) {
    return `${type}_${lang}_${id}`;
  } else {
    return `${type}_${lang}`;
  }
}

interface GlobalEditor extends Vue {
  $languages: Map<object, string>;
}

interface TypeInfo {
  name: string;
  count: number;
}
</script>
