<template>
  <page class="flex-grow-1 d-flex flex-column">
    <!-- editor -->
    <b-form-row class="flex-grow-1">
      <!-- files -->
      <b-col lg="3" class="d-flex flex-column">
        <!-- template name -->
        <h3 class="text-truncate">{{ name }}</h3>
        <!-- path -->
        <b-form-select :options="paths" :value="path" size="sm" class="mb-2" @change="changePath"></b-form-select>
        <!-- table -->
        <b-overlay :show="busy" class="flex-grow-1 files-container mb-2" no-fade>
          <b-table
            :fields="columns"
            :items="files"
            :empty-text="$t('template-editor.message.workspace-empty')"
            primary-key="name"
            select-mode="single"
            ref="files"
            class="mb-0"
            selectable
            show-empty
            small
            hover
            @row-selected="fileSelected">
            <!-- item -->
            <template #cell(name)="{ item }">
              <!-- folder -->
              <div v-if="isFolder(item)">
                <b-icon icon="folder2"></b-icon>
                {{ item.name }}
              </div>
              <!-- file -->
              <div v-else class="d-flex justify-content-between align-items-center">
                <!-- name & icon -->
                <div>
                  <b-icon icon="file-earmark"></b-icon>
                  {{ item.name }}
                </div>
                <!-- actions -->
                <b-dropdown variant="link" toggle-class="p-0">
                  <b-dropdown-item-button :disabled="item.name === 'main.stg'" @click="deleteFile(item)">
                    {{ $t('template-editor.label.delete-file') }}
                  </b-dropdown-item-button>
                </b-dropdown>
              </div>
            </template>
          </b-table>
        </b-overlay>
        <!-- actions -->
        <div class="mb-3 d-flex justify-content-between align-items-center">
          <!-- back link -->
          <b-link :to="{ name: 'account-templates' }">
            {{ $t('template-editor.label.back-link') }}
          </b-link>
          <!-- new button -->
          <b-dropdown :text="$t('template-editor.label.new-file')" :disabled="busy || assets.length >= 100" split dropup right @click="newFile">
            <b-dropdown-item-button :disabled="!assets.length" @click="creatingFolder = true">
              {{ $t('template-editor.label.new-folder') }}
            </b-dropdown-item-button>
          </b-dropdown>
        </div>
      </b-col>
      <!-- editor -->
      <b-col lg="9" class="d-flex flex-column">
        <div class="editor-header" ref="editor">
          <h3>{{ locale }}</h3>
        </div>
        <div class="flex-grow-1">
          <file-editor :context="context" class="h-100" @input="setFileChanged" @save="save"></file-editor>
        </div>
      </b-col>
    </b-form-row>
    <!-- modal -->
    <new-file v-if="creatingFile" @input="createFile" @hidden="creatingFile = false"></new-file>
    <new-folder v-if="creatingFolder" :context="context" :parent="path" @input="createFolder" @hidden="creatingFolder = false"></new-folder>
    <PreviewModal
      :reg-id="id"
      :page="context"
      v-model="saving"
      @input="update"
      @applicable-data="editApplicableData"
      @preview-job="editPreviewJob"
      @experience-options="editExperienceOptions"
      @education-options="editEducationOptions"
      @skill-options="editSkillOptions"
      @publish="publish">
    </PreviewModal>
    <ApplicableData :reg-id="id" :context="context" v-model="editingApplicableData" @input="updateApplicableData"></ApplicableData>
    <UpdatePreviewJob v-if="editingPreviewJob" @input="updatePreviewJob" @hidden="editingPreviewJob = false"></UpdatePreviewJob>
    <MarkdownOptions v-model="editingMarkdownOptions"></MarkdownOptions>
    <SkillOptions :reg-id="id" :context="context" v-model="editingSkillOptions" @input="updateSkillOptions"></SkillOptions>
    <PublishModal :reg-id="id" v-model="publishing" @input="publishComplete"></PublishModal>
  </page>
</template>

<style lang="scss" scoped>
@import '~@/styles/bootstrap';

.files-container {
  overflow-y: auto;
  height: 300px;
}

.editor-header {
  scroll-margin-top: $navbar-height;
}
</style>

<script lang="ts">
import {
  BCol,
  BDropdown,
  BDropdownItemButton,
  BFormRow,
  BFormSelect,
  BIcon,
  BIconFileEarmark,
  BIconFolder2,
  BLink,
  BOverlay,
  BTable,
  BvTableFieldArray
} from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { TranslateResult } from 'vue-i18n';
import { PaymentReceivingMethodService } from '@/clients/payment-receiving-method';
import {
  EducationOptions,
  ExperienceOptions,
  SkillGrouping,
  SkillOptions as SkillRenderOptions,
  TemplateAsset,
  TemplateRegistration,
  TemplateRegistrationService
} from '@/clients/template-registration';
import Page from '@/components/page';
import { getLanguageName } from '@/i18n';
import { AddAlert, Source, SuccessAlert } from '@/store';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';
import ApplicableData from './applicable-data.vue';
import FileEditor from './file-editor.vue';
import MarkdownOptions from './markdown-options.vue';
import { DirtyFlags, MarkdownContext, MarkdownResult, PageContext, PageContextKey, RemoteContent, SaveContext } from './models';
import NewFile from './new-file.vue';
import NewFolder from './new-folder.vue';
import PreviewModal from './preview-modal.vue';
import PublishModal from './publish-modal.vue';
import SkillOptions from './skill-options.vue';
import UpdatePreviewJob from './update-preview-job.vue';
import { getFileContent } from './util';

export default (Vue as VueConstructor<TemplateEditor>).extend({
  components: {
    ApplicableData,
    BCol,
    BDropdown,
    BDropdownItemButton,
    BFormRow,
    BFormSelect,
    BIcon,
    BIconFileEarmark,
    BIconFolder2,
    BLink,
    BOverlay,
    BTable,
    FileEditor,
    MarkdownOptions,
    NewFile,
    NewFolder,
    Page,
    PreviewModal,
    PublishModal,
    SkillOptions,
    UpdatePreviewJob
  },
  props: {
    templateId: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      folders: new Array<string>(),
      assets: new Array<TemplateAsset>(),
      context: new PageContext(),
      creatingFile: false,
      creatingFolder: false,
      saving: null as SaveContext | null,
      editingApplicableData: false,
      editingPreviewJob: false,
      editingMarkdownOptions: null as MarkdownContext | null,
      editingSkillOptions: false,
      publishing: false
    };
  },
  computed: {
    id: function (): Uuid {
      return new Uuid(this.templateId);
    },
    registration: function (): TemplateRegistration | null {
      return this.context.registration;
    },
    name: function (): TranslateResult {
      if (this.registration) {
        return this.registration.name;
      } else {
        return this.$t('template-editor.label.name-ph');
      }
    },
    path: function (): string {
      return this.context.path;
    },
    paths: function (): PathItem[] {
      const items: PathItem[] = [{ text: '/', value: '' }];
      let i = -1;

      while ((i = this.path.indexOf('/', i + 1)) !== -1) {
        const path = this.path.substring(0, i);

        items.push({ text: '/' + path, value: path + '/' });
      }

      return items;
    },
    columns: function (): BvTableFieldArray {
      return [
        {
          key: 'name',
          label: this.$t('template-editor.label.file-column') as string
        }
      ];
    },
    files: function (): Array<FileItem> {
      const result = new Array<FileItem>();

      // folders
      for (const folder of this.folders) {
        result.push(new FileItem(folder, null));
      }

      // files
      for (const asset of this.assets) {
        const name = asset.name;

        if (!name.startsWith(this.path) || name.indexOf('/', this.path.length) !== -1) {
          continue;
        }

        result.push(new FileItem(name.substring(this.path.length), asset));
      }

      return result;
    },
    selected: function (): TemplateAsset | null {
      return this.context.selected;
    },
    locale: function (): TranslateResult {
      if (this.registration) {
        return getLanguageName(this.registration.language, this.$store.state.locale);
      } else {
        return this.$t('template-editor.label.locale-ph');
      }
    },
    busy: function (): boolean {
      return this.context.busy;
    }
  },
  provide: function (): object {
    return {
      [PageContextKey]: this.context
    };
  },
  fetch: async function () {
    const ts = new TemplateRegistrationService(this.$rest);
    const ps = new PaymentReceivingMethodService(this.$rest);

    // load registration
    let registration;

    try {
      registration = await ts.get(this.id);
    } catch (e) {
      // TODO: display alert
      return;
    }

    // load workspace
    let workspace;

    try {
      workspace = await ts.getWorkspace(this.id);
    } catch (e) {
      // TODO: display aert
      return;
    }

    // load payment receiving methods
    let payments;

    try {
      payments = await ps.list();
    } catch (e) {
      // TODO: display alert
      return;
    }

    // Trigger reactivity.
    const dirs = new Set<string>();

    this.context.registration = registration;
    this.context.payments = payments;
    this.context.applicableData = workspace.applicableData;
    this.context.previewJob = workspace.previewJob;
    this.context.options.experience = workspace.renderOptions.experience ?? new ExperienceOptions(null, null);
    this.context.options.education = workspace.renderOptions.education ?? new EducationOptions(null, null);
    this.context.options.skill = workspace.renderOptions.skill ?? new SkillRenderOptions(SkillGrouping.None);

    this.assets = workspace.assets;

    for (const asset of this.assets) {
      // set asset content
      const name = asset.name;

      this.$set(this.context.files, name, new RemoteContent(asset.size));

      // add directory
      const sep = name.indexOf('/');

      if (sep !== -1) {
        dirs.add(name.substring(0, sep));
      }
    }

    this.folders = [...dirs].sort((a, b) => a.localeCompare(b, 'en'));
    this.assets.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  },
  beforeCreate: function () {
    this.$updates = new Set();
    this.$deletes = new Set();
  },
  methods: {
    changePath: function (p: string): void {
      const folders = new Set<string>();

      for (const { name } of this.assets) {
        if (!name.startsWith(p)) {
          continue;
        }

        const i = name.indexOf('/', p.length);

        if (i !== -1) {
          folders.add(name.substring(p.length, i));
        }
      }

      this.context.path = p;
      this.folders = [...folders].sort((a, b) => a.localeCompare(b, 'en'));
    },
    isFolder: function (i: FileItem): boolean {
      return i.asset === null;
    },
    newFile: function (): void {
      if (this.assets.length) {
        this.creatingFile = true;
      } else {
        this.createFile('main.stg', Template);
        this.context.applicableData = ['name'];
        this.context.dirty |= DirtyFlags.ApplicableData;
      }
    },
    createFile: function (name: string, content: unknown): void {
      const path = this.path + name;

      if (this.context.files[path] !== undefined) {
        throw new Error(`File ${path} is already exists.`);
      }

      const asset = new TemplateAsset(path, 0, new Date());

      this.assets.push(asset);
      this.$set(this.context.files, path, content);
      this.$updates.add(path);
      this.selectFile(name);
    },
    createFolder: function (name: string): void {
      this.folders.push(name);
      this.selectFile(name);
    },
    selectFile: async function (name: string): Promise<void> {
      // we need to wait for adding to be effective so the model and the view have the same items and order
      await this.$nextTick();

      const index = this.files.findIndex(f => f.name === name);

      if (index === -1) {
        throw new Error(`Unknown file ${name}.`);
      }

      (this.$refs.files as any).selectRow(index);
    },
    fileSelected: async function (items: FileItem[]): Promise<void> {
      if (this.$pending) {
        const name = this.selected?.name;

        if (!name) {
          throw new Error('No file is selected.');
        }

        this.$set(this.context.files, name, this.$pending());
        delete this.$pending;
      }

      const selected = items.length ? items[0] : null;

      if (!selected) {
        // de-selection will always occurred with file, not folder
        this.context.selected = null;
        return;
      }

      const asset = selected.asset;

      if (asset) {
        // selection is a file
        const service = new TemplateRegistrationService(this.$rest);
        const name = asset.name;
        let content = this.context.files[name];

        if (content === undefined) {
          throw new Error(`No content for file ${name}.`);
        }

        this.context.selected = asset;
        (this.$refs.editor as Element).scrollIntoView();

        // fetch remote content
        if (content instanceof RemoteContent) {
          this.context.busy = true;

          try {
            content = await service.getWorkspaceAsset(this.id, name);
            content = await getFileContent(name, content as Blob);
          } catch (e) {
            const error = e as Error;
            this.$error(Source.Server, () => this.$t('template-editor.message.fetch-asset-content-error', { error: error.message }), error);
            return;
          } finally {
            this.context.busy = false;
          }

          this.context.files[name] = content;
          (this.$refs.editor as Element).scrollIntoView();
        }
      } else {
        // selection is a folder
        this.changePath(`${this.path}${selected.name}/`);
      }
    },
    deleteFile: function (item: FileItem): void {
      const target = item.asset;

      if (!target) {
        throw new Error('The specified item is not a file.');
      }

      const name = target.name;
      const index = this.assets.indexOf(target);

      if (index === -1) {
        throw new Error(`Unknow file ${name}.`);
      }

      this.assets.splice(index, 1);
      this.$delete(this.context.files, name);
      this.$updates.delete(name);

      if (target.size) {
        this.$deletes.add(name);
      }
    },
    setFileChanged: function (content: () => unknown): void {
      const name = this.selected?.name;

      if (!name) {
        throw new Error('No file is selected.');
      }

      this.$pending = content;
      this.$updates.add(name);
    },
    save: function (): void {
      if (this.$pending) {
        const name = this.selected?.name;

        if (!name) {
          throw new Error('No file is selected.');
        }

        this.$set(this.context.files, name, this.$pending());
        delete this.$pending;
      }

      const deletes = new Set(this.$deletes);
      const updates = new Set(this.$updates);

      this.saving = new SaveContext(this.name as string, deletes, updates);
    },
    update: function (v: unknown): void {
      if (typeof v === 'string') {
        this.$deletes.delete(v);
      } else if (typeof v === 'number') {
        this.context.dirty = v;
      } else if (v instanceof TemplateAsset) {
        const current = this.assets.find(a => a.name === v.name);

        if (!current) {
          throw new Error(`Unknow asset updated ${v.name}.`);
        }

        current.size = v.size;
        current.lastModified = v.lastModified;

        this.$updates.delete(v.name);
      } else {
        throw new Error(`Unknown update value ${v}.`);
      }
    },
    editApplicableData: function (): void {
      this.editingApplicableData = true;
    },
    editPreviewJob: function (): void {
      this.editingPreviewJob = true;
    },
    updateApplicableData: function (v: string[]): void {
      this.context.applicableData = v;
      this.context.dirty &= ~DirtyFlags.ApplicableData;
    },
    updatePreviewJob: function (v: Uuid | null): void {
      this.context.previewJob = v;
    },
    editExperienceOptions: function (): void {
      const title = this.$t('template-editor.label.experience-options-title');
      const src = this.context.options.experience;
      const save = this.updateExperienceOptions;

      this.editingMarkdownOptions = new MarkdownContext(title, src, save);
    },
    updateExperienceOptions: async function (r: MarkdownResult): Promise<boolean> {
      // setup update
      let update: ExperienceOptions | null;

      if (r.paragraph || r.listOptions) {
        update = new ExperienceOptions(r.paragraph ?? null, r.listOptions ?? null);
      } else {
        update = null;
      }

      // execute update
      const service = new TemplateRegistrationService(this.$rest);

      try {
        await service.writeWorkspaceExperienceOptions(this.id, update);
      } catch (e) {
        // TODO: display alert
        return false;
      }

      if (update) {
        this.context.options.experience = update;
      } else {
        this.context.options.experience = new ExperienceOptions(null, null);
      }

      return true;
    },
    editEducationOptions: function (): void {
      const title = this.$t('template-editor.label.education-options-title');
      const src = this.context.options.education;
      const save = this.updateEducationOptions;

      this.editingMarkdownOptions = new MarkdownContext(title, src, save);
    },
    updateEducationOptions: async function (r: MarkdownResult): Promise<boolean> {
      // setup update
      let update: EducationOptions | null;

      if (r.paragraph || r.listOptions) {
        update = new EducationOptions(r.paragraph ?? null, r.listOptions ?? null);
      } else {
        update = null;
      }

      // execute update
      const service = new TemplateRegistrationService(this.$rest);

      try {
        await service.writeWorkspaceEducationOptions(this.id, update);
      } catch (e) {
        // TODO: display alert
        return false;
      }

      if (update) {
        this.context.options.education = update;
      } else {
        this.context.options.education = new EducationOptions(null, null);
      }

      return true;
    },
    editSkillOptions: function (): void {
      this.editingSkillOptions = true;
    },
    updateSkillOptions: function (v: SkillRenderOptions): void {
      this.context.options.skill = v;
    },
    publish: function (): void {
      this.publishing = true;
    },
    publishComplete: function (id: ULID): void {
      // close modals
      this.publishing = false;
      this.saving = null;

      // display alert
      const alert = new SuccessAlert(() => this.$t('template-editor.message.publish-success'));
      const mutation = new AddAlert(Source.Server, alert);

      this.$nextTick(function () {
        this.$store.commit(mutation);
      });
    }
  }
});

const Template = `resume(data) ::= <<
<! The purpose of this file is to transform resume data (e.g. name, email, etc.) into LaTeX file. !>
<! This file will be compiled to main.tex then passed to xelatex. !>
<! Syntax documentation: https://github.com/antlr/stringtemplate4/blob/master/doc/cheatsheet.md !>
<! A common mistake in this file is '\\\\' due to it will compiled to '\\'. Use '\\\\\\\\' if you want '\\\\'. !>
<! You can create or upload a new file to be using by main.tex like font, cls, sty, etc. by clicking on New button again. !>
<! Other files will be passed to xelatex as is. No transforming or preprocessing. !>
\\documentclass[11pt,letterpaper,sans]{moderncv}

\\moderncvstyle{classic}
\\moderncvcolor{blue}

\\usepackage[scale=0.75]{geometry}
\\usepackage{enumitem}

% Other data than name need to be enable in the options that is inside the preview modal when you click on Save button.
% The data that is not enabled will not be passed to this file.
% All of data is already escaped by the system (e.g. if user enter '{' what you will get here is '\\{').
<name(data.name)>
<title(data.headline)>
<address(data.address)>
<mobile(data.mobile)>
<email(data.email)>
<linkedin(data.linkedin)>
<github(data.github)>
<photo(data.photo)>
<quote(data.summary)>

\\begin{document}

\\makecvtitle

% If you use built-in data as a preview you need to set experience options in the preview modal as the following:
% Paragraph end: \\vskip 0pt\\smallskip{}
% List options: noitemsep,topsep=0pt,after=\\smallskip
<if(data.experience)>\\section{Experience}<endif>
<data.experience:experience()>

% If you use built-in data as a preview you need to set education options in the preview modal as the following:
% Paragraph end: \\vskip 0pt\\smallskip{}
% List options: noitemsep,topsep=0pt,after=\\smallskip
<if(data.education)>\\section{Education}<endif>
<data.education:education()>

% If you use built-in data as a preview you need to set skill options in the preview modal as the following:
% Group by: Level
<if(data.skill)>\\section{Skills}<endif>
<skill(data.skill)>

<if(data.language)>\\section{Languages}<endif>
<data.language:language()>

\\end{document}
>>

name(v) ::= "<if(v && v.firstName && v.lastName)>\\name{<firstName(v)>}{<v.lastName>}<else>\\name{John Michael}{Doe}<endif>"
firstName(v) ::= "<if(v.middleName)><v.firstName> <v.middleName><else><v.firstName><endif>"
title(v) ::= "<if(v)>\\title{<v>}<endif>"
address(v) ::= "<if(v)>\\address{<v.street>}{<v.region>}{<v.country>}<endif>"
mobile(v) ::= "<if(v)>\\phone[mobile]{<v>}<endif>"
email(v) ::= "<if(v)>\\email{<v>}<endif>"
linkedin(v) ::= "<if(v)>\\social[linkedin]{<v>}<endif>"
github(v) ::= "<if(v)>\\social[github]{<v>}<endif>"
photo(v) ::= "<if(v)>\\photo[64pt][0.4pt]{<v>}<endif>"
quote(v) ::= "<if(v)>\\quote{<v>}<endif>"
experience(v) ::= "\\cventry{<experienceStart(v.start)>--<experienceEnd(v.end)>}{<v.title>}{<v.company>}{<experienceAddress(v)>}{<experienceCountry(v)>}{<v.description>}"
experienceStart(v) ::= "<if(v)><v.year><endif>"
experienceEnd(v) ::= "<if(v)><v.year><else>present<endif>"
experienceAddress(v) ::= "<if(v.country)><v.region><else><v.street><endif>"
experienceCountry(v) ::= "<if(v.country)><v.country><else><v.region><endif>"
education(v) ::= "\\cventry{<v.start.year>--<educationEnd(v.end)>}{<v.degree>}{<v.institute>}{<addr(v)>}{<grade(v.grade)>}{<v.description>}"
educationEnd(v) ::= "<if(v)><v.year><else>present<endif>"
skill(v) ::= <<
<if(v.expert)>\\cvitem{Expert}{<v.expert;separator=", ">}<endif>
<if(v.novice)>\\cvitem{Basic}{<v.novice;separator=", ">}<endif>
>>
language(v) ::= "\\cvitemwithcomment{<v.name>}{<v.proficiency>}{<v.comment>}"

addr(v) ::= "<if(v.country)><v.country><else><v.region><endif>"
grade(v) ::= "<if(v)>\\textit{<v>}<endif>"`;

interface TemplateEditor extends Vue {
  $updates: Set<string>;
  $deletes: Set<string>;
  $pending?: () => unknown;
}

interface PathItem {
  text: string;
  value: string;
}

class FileItem {
  name: string;
  asset: TemplateAsset | null;

  constructor(name: string, asset: TemplateAsset | null) {
    this.name = name;
    this.asset = asset;
  }
}
</script>
