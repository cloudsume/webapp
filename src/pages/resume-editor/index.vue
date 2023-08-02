<template>
  <Page>
    <!-- content -->
    <BRow>
      <!-- left pane -->
      <BCol lg="8">
        <PreviewPane
          :resume="resume"
          :template="template"
          @link-created="linkCreated"
          @link-deleted="linkDeleted"
          @name-updated="nameUpdated"
          @template-updated="templateUpdated"
          @recruitment-consent="recruitmentConsent">
        </PreviewPane>
      </BCol>
      <!-- right pane -->
      <BCol lg="4">
        <h3>{{ language }}</h3>
        <EditPane
          :resume="resume"
          :template="template"
          @create="createData"
          @delete="deleteData"
          @change="updateFlags"
          @switch="updateParent"
          @up="swapDataEntryUp"
          @down="swapDataEntryDown"
          @result="updateResult"
          @dirty="setDirty"
          @submit.prevent="save"
          @globalimport="showGlobalImportModal">
        </EditPane>
      </BCol>
    </BRow>
    <!-- modals -->
    <TutorialModal v-if="viewingTutorial" @hidden="tutorialHidden"></TutorialModal>
    <GlobalModal v-if="globalImporting" :context="globalImporting" @input="globalImported" @hidden="globalImporting = null"></GlobalModal>
  </Page>
</template>

<script setup lang="ts">
import { toJSON } from '@ultimicro/json-mapper';
import { BCol, BRow } from 'bootstrap-vue';
import Vue, { onUnmounted, provide, reactive, ref, Ref } from 'vue';
import { ClientKey, RequestError } from '@/clients/rest';
import { ResumeLink, ResumeService } from '@/clients/resume';
import { MultiplicableData, ResumeData, ResumeDataService } from '@/clients/resume-data';
import { TemplateService } from '@/clients/template';
import { RegistrationCategory, TemplateLicenseStatus, TemplateRegistrationService } from '@/clients/template-registration';
import { ContextKey, DataFlags, DataState, DataTable, getDataMetadata, maxEntries, ResultFactory, UpdateWriter } from '@/components/data-editor';
import Page from '@/components/page';
import { ParentData } from '@/components/parent-selector';
import { StorageKey } from '@/config';
import { getLanguageName, getParentLanguage, useTranslation } from '@/i18n';
import { Alert, I18n } from '@/services';
import { Loading, Locale } from '@/state';
import { Source } from '@/store';
import { asyncInit } from '@/util/async-init';
import { bind } from '@/util/binder';
import { computed } from '@/util/computed';
import { group } from '@/util/grouper';
import { inject } from '@/util/injector';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';
import EditPane from './edit-pane.vue';
import GlobalModal from './global-modal.vue';
import { Context, DataEntry, GlobalModalContext, Resume, Template } from './models';
import PreviewPane from './preview-pane.vue';
import TutorialModal from './tutorial-modal.vue';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  resumeId: {
    type: String,
    required: true
  },
  stripePayment: String,
  stripeSecret: String
});

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// global states
const i18n = inject(I18n);
const loading = inject(Loading);
const locale = inject(Locale);

// local states
const context = reactive(new Context(i18n)) as Context;
const resume: Ref<Resume | null> = ref(null);
const template: Ref<Template | null> = ref(null);
const viewingTutorial = ref(false);
const globalImporting: Ref<GlobalModalContext | null> = ref(null);

let hasGlobal = false;
let nextId = 0;
let remoteCount = new Map<string, number>();

// computed
const language = computed({ template }, function (): string {
  const template = this.template.value;

  if (!template) {
    return t('unknow-language.label.header');
  } else {
    return getLanguageName(template.language, locale.value);
  }
});

// functions
const reload = bind({ resume, template }, async function () {
  let resume;

  // reset state for refetch case
  this.resume.value = null;
  this.template.value = null;

  // fetch resume
  const service = new ResumeService(rest);

  try {
    resume = await service.get(new Uuid(props.resumeId));
  } catch (e) {
    alert.error(Source.Server, () => t('edit-resume.message.fetch-resume-error'), e as Error);
    return;
  }

  // fetch template
  const rs = new TemplateRegistrationService(rest);
  let template, tr, license;

  try {
    const ts = new TemplateService(rest);

    template = await ts.get(new ULID(resume.template));
    tr = await rs.get(template.registrationId);
  } catch (e) {
    alert.error(Source.Server, () => t('edit-resume.message.fetch-template-error'), e as Error);
    return;
  }

  if (template.category === RegistrationCategory.Paid) {
    try {
      license = await rs.getLicense(template.registrationId);
    } catch (e) {
      // TODO: display alert
    }
  }

  // fetch global data
  if (!hasGlobal) {
    // fetch all data in the locale tree without trigger reactivity
    const service = new ResumeDataService(rest);
    const globals = new Array<{ lang: string, list: ResumeData[] }>();

    for (let lang: string | null = tr.language; lang !== null; lang = getParentLanguage(lang)) {
      let list;

      try {
        list = await service.list(lang || 'default');
      } catch (e) {
        // TODO: display alert
        return;
      }

      globals.push({ lang, list });
    }

    // populate table
    for (const { lang, list } of globals) {
      for (const data of list) {
        let table = context.globals[data.type];

        if (!table) {
          Vue.set(context.globals, data.type, table = new DataTable());
        }

        let set = table[lang];

        if (!set) {
          Vue.set(table, lang, set = []);
        }

        set.push(Object.freeze(data));
      }
    }

    hasGlobal = true;
  }

  // create data entries
  const groups = group(resume.data, d => d.type);
  const entries = new Array<DataEntry>();
  const count = new Map<string, number>();
  const indices = new Map<DataState, number>();

  for (const type of template.applicableData) {
    const sources = groups.get(type);

    // create a placeholder if no data for this type
    if (sources === undefined) {
      entries.push(new DataEntry(nextId++, type));
      continue;
    }

    // populate data entries
    for (let i = 0; i < sources.length; i++) {
      const s = sources[i];
      const remote = Object.freeze(s.value); // prevent vue from observe its properties
      const parent = context.parent(s, tr.language);
      const state = new DataState(remote, parent ? new ParentData(parent.type, tr.language, Object.freeze(parent.value)) : null);
      const entry = new DataEntry(nextId++, type, state);

      entries.push(entry);
      indices.set(state, i);
    }

    // add a placeholder for multiplicable data
    if (sources[0].value instanceof MultiplicableData && sources.length < maxEntries(type)) {
      entries.push(new DataEntry(nextId++, type));
    }

    count.set(type, sources.length);
  }

  // display alert if redirected from template purchasing
  if (props.stripePayment) {
    if (license?.status === TemplateLicenseStatus.Valid) {
      alert.success(Source.App, () => t('resume-editor.message.template-purchase-success'));
    } else {
      alert.error(Source.App, () => t('resume-editor.message.template-purchase-failed'));
    }
  }

  // fetch thumbnails
  const thumbnails = new Array<string>();

  try {
    for (const url of resume.thumbnails) {
      thumbnails.push(await rest.getFileURL(url));
    }
  } catch (e) {
    for (const url of thumbnails) {
      URL.revokeObjectURL(url);
    }

    alert.error(Source.Server, () => t('edit-resume.message.fetch-thumbnail-error'), e as Error);
    return;
  }

  // trigger reactivity
  remoteCount = count;
  context.remotePositions = indices;
  this.resume.value = new Resume(resume, thumbnails, entries);
  this.template.value = new Template(template, tr, license ?? null);
  viewingTutorial.value = localStorage.getItem(StorageKey.ResumeEditingDisplayed) === null;
});

const createData = function (id: number): void {
  if (!resume.value) {
    throw new Error('No loaded resume.');
  }

  // create state
  const data = resume.value.data;
  const index = data.findIndex(e => e.id === id);
  let entry;

  if (index === -1 || (entry = data[index]).state) {
    throw new Error(`Invalid data entry ${id}.`);
  }

  entry.state = new DataState(null, null);

  // create placeholder
  let total = 0;

  for (let i = index; i >= 0 && data[i].type === entry.type; i--) {
    total++;
  }

  if (total >= maxEntries(entry.type)) {
    return;
  }

  data.splice(index + 1, 0, new DataEntry(nextId++, entry.type));
};

const deleteData = function (id: number): void {
  if (!resume.value) {
    throw new Error('No loaded resume.');
  }

  // delete entry
  const data = resume.value.data;
  const index = data.findIndex(e => e.id === id);

  if (index === -1) {
    throw new Error(`Invalid data entry ${id}.`);
  }

  const entry = data[index];

  if (!entry.state) {
    throw new Error(`Entry ${id} is a placeholder.`);
  }

  data.splice(index, 1);

  if (entry.state.remote) {
    resume.value.deletes.push(entry);
  }

  // add placeholder if required
  let entriesCount = 0;
  let lastEntryId = -1;

  for (let i = 0; i < data.length; i++) {
    const currentEntry = data[i];

    if (currentEntry.type === entry.type) {
      // there is a placeholder existing in the group, so no need to add it.
      if (!currentEntry.state) {
        return;
      }

      entriesCount++;

      if (currentEntry.id > lastEntryId) {
        lastEntryId = currentEntry.id;
      }
    }
  }

  // if last entry was removed, add a placeholder to its position.
  if (entriesCount === 0) {
    data.splice(index, 0, new DataEntry(nextId++, entry.type));
    return;
  }

  // otherwise add placeholder to the last index of their group.
  const newPlaceholderIndex = data.findIndex(e => e.id === lastEntryId) + 1;

  data.splice(newPlaceholderIndex, 0, new DataEntry(nextId++, entry.type));
};

const swapDataEntry = function (id: number, next: number): void {
  if (!resume.value) {
    throw new Error('No loaded resume.');
  }

  const data = resume.value.data;
  const entryIndex = data.findIndex(e => e.id === id);

  if (entryIndex === -1) {
    throw new Error(`Invalid data entry ${id}.`);
  }

  const current = data[entryIndex];

  if (!(current && current.state)) {
    throw new Error('Data does not exists.');
  }

  const swapIndex = entryIndex + next;
  const swap = data[swapIndex];

  if (!(swap && swap.state)) {
    throw new Error('Swap data does not exists.');
  }

  if (swap.type !== current.type) {
    throw new Error('Unable to swap between types');
  }

  data.splice(swapIndex, 1, current);
  data.splice(entryIndex, 1, swap);
};

const swapDataEntryUp = function (id: number): void {
  swapDataEntry(id, -1);
};

const swapDataEntryDown = function (id: number): void {
  swapDataEntry(id, 1);
};

const updateFlags = function (s: DataState, f: DataFlags): void {
  s.flags = f;
};

const updateParent = function (s: DataState, p: ParentData | null): void {
  s.parent = p;
};

const updateResult = function (s: DataState, r: ResultFactory): void {
  s.result = r;
};

const setDirty = function (s: DataState, v: boolean): void {
  s.dirty = v;
};

const save = async function (): Promise<void> {
  if (!resume.value) {
    throw new Error('No resume is loaded.');
  }

  // remove focus from last input to prevent browser scroll back to it when save completed
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  // create a request
  const updates = new FormData();
  const count = new Map<string, number>();

  resume.value.iterateData((e, i) => {
    const s = e.state;

    // skip placeholder
    if (!s) {
      return;
    } else if (!s.result) {
      throw new Error('No result factory has been set.');
    }

    // setup writer
    const p = s.parent as ParentData | null;
    const w = new class extends UpdateWriter {
      getParent(): Uuid | null {
        if (p && p.value instanceof MultiplicableData) {
          return p.value.id;
        } else {
          return null;
        }
      }

      writeUpdate(data: object): void {
        // get key
        let key;

        if (data instanceof MultiplicableData) {
          key = `update:${e.type}:${i}`;
        } else {
          key = `update:${e.type}`;
        }

        // write update
        updates.append(key, new Blob([toJSON(data)], { type: 'application/json' }));
      }

      writeContent(id: string, value: string | Blob): void {
        updates.append(`content:${id}`, value);
      }
    };

    // new entry is always dirty so if dirty flag is false that mean we have remote index for sure
    if (s.dirty || i !== context.remotePositions.get(s)) {
      s.result(w);
    }

    count.set(e.type, (count.get(e.type) ?? 0) + 1);
  });

  for (const [type, remote] of remoteCount) {
    const local = count.get(type) ?? 0;

    if (local >= remote) {
      continue;
    }

    if (maxEntries(type) === 1) {
      updates.append(`delete:${type}`, '');
    } else {
      for (let i = local; i < remote; i++) {
        updates.append(`delete:${type}:${i}`, '');
      }
    }
  }

  // invoke api
  const service = new ResumeService(rest);
  let result;

  window.scrollTo(0, 0);
  context.saving = true;

  try {
    result = await service.patchData(new Uuid(props.resumeId), updates);
  } catch (e) {
    // Check if bad request.
    let message;

    if (e instanceof RequestError) {
      const first = e.errors.entries().next();

      if (!first.done) {
        const [key, errors] = first.value;
        const update = /^update\:(\w+)(\:\d+)?$/.exec(key);

        if (update) {
          message = function () {
            const index = update[2];
            const type = getDataMetadata(update[1]).label(i18n, index ? parseInt(index.slice(1)) + 1 : undefined);

            return t('resume-editor.message.invalid-update', { type, error: errors[0] });
          };
        }
      }
    }

    if (!message) {
      message = () => t('edit-resume.message.data-update-error', { error: e });
    }

    alert.error(Source.Server, message, e as Error);
    context.saving = false;
    return;
  }

  // fetch thumbnails
  let thumbnails = new Array<string>();

  try {
    for (const url of result.thumbnails) {
      thumbnails.push(await rest.getFileURL(url));
    }
  } catch (e) {
    for (const url of thumbnails) {
      URL.revokeObjectURL(url);
    }

    thumbnails = [];
    alert.error(Source.Server, () => t('edit-resume.message.fetch-thumbnail-error'), e as Error);
  } finally {
    context.saving = false;
  }

  resume.value.updateThumbnails(thumbnails);

  // update remote value
  const remotes = group(result.data, d => d.type);

  resume.value.iterateData((e, i) => {
    const s = e.state;

    if (s && (s.dirty || i !== context.remotePositions.get(s))) {
      // we don't need to clear a dirty flag here due to the editor will reactive on remote changed and trigger an update on dirty flag anyway
      const remote = remotes.get(e.type);

      if (remote === undefined || remote[i] === undefined) {
        // this should never happens
        throw new Error(`No data for ${e.type}:${i} on the server side.`);
      }

      s.remote = Object.freeze(remote[i].value);
      context.remotePositions.set(s, i);
    }
  });

  resume.value.deletes = [];
  remoteCount = count;
};

const linkCreated = function (l: ResumeLink): void {
  if (!resume.value) {
    throw new Error('No loaded resume.');
  }

  resume.value.links.push(l);
};

const linkDeleted = function (id: string): void {
  if (!resume.value) {
    throw new Error('No loaded resume.');
  }

  const i = resume.value.links.findIndex(l => l.id === id);

  if (i === -1) {
    throw new Error(`Unknow link ${id}.`);
  }

  resume.value.links.splice(i, 1);
};

const nameUpdated = function (v: string): void {
  if (!resume.value) {
    throw new Error('No loaded resume.');
  }

  resume.value.name = v;
};

const templateUpdated = async function () {
  // template changing effect so many thing so it is better to refresh the whole page
  loading.value++;

  try {
    await reload();
  } finally {
    loading.value--;
  }
};

const recruitmentConsent = function (v: boolean) {
  if (!resume.value) {
    throw new Error('No loaded resume.');
  }

  resume.value.recruitmentConsent = v;
};

const tutorialHidden = function (): void {
  if (localStorage.getItem(StorageKey.ResumeEditingDisplayed) === null) {
    localStorage.setItem(StorageKey.ResumeEditingDisplayed, new Date().toJSON());
  }

  viewingTutorial.value = false;
};

const showGlobalImportModal = function (type: string, state: DataState): void {
  if (!resume.value) {
    throw new Error('No loaded resume.');
  }

  if (!template.value) {
    throw new Error('No loaded template.');
  }

  globalImporting.value = new GlobalModalContext(resume.value.id, template.value.language, type, state);
};

const globalImported = function (result: DataTable): void {
  const ctx = globalImporting.value;

  if (!ctx) {
    throw new Error('No available importing context.');
  }

  // update global table
  let t = context.globals[ctx.type];

  if (!t) {
    Vue.set(context.globals, ctx.type, t = new DataTable());
  }

  for (const lang in result) {
    const s = t[lang];

    if (!s) {
      Vue.set(t, lang, result[lang]);
    } else {
      s.push(...result[lang]);
    }
  }

  // update trigger's parent
  ctx.trigger.parent = new ParentData(result[ctx.lang][0].type, ctx.lang, Object.freeze(result[ctx.lang][0].value));
};

// lifecycle hooks
asyncInit(reload);
onUnmounted(() => resume.value?.dispose());

// provides
provide(ContextKey, context);
</script>
