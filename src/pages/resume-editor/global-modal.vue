<template>
  <wizard-modal
    :title="$t('global-modal.label.title')"
    start="source"
    :navigator="navigate"
    :completor="complete"
    body-class="pb-0"
    @input="$emit('input', $event)"
    @hidden="$emit('hidden', $event)">
    <!-- source -->
    <template #page(source)="{ ready, update }">
      <global-list :resume="context.resume" :lang="context.lang" :type="context.type" @ready="ready" @change="update"></global-list>
    </template>
    <!-- extract from resume data -->
    <template #page(extract-resume)="{ data, ready, update }">
      <extract-resume :type="context.type" :data="data.data" :target-lang="context.lang" @ready="ready" @change="update"></extract-resume>
    </template>
    <!-- completes -->
    <template #complete(extract-resume)="{ disabled, proceed }">
      <b-button variant="primary" :disabled="disabled" @click="proceed">
        {{ $t('global-modal.label.import-button') }}
      </b-button>
    </template>
  </wizard-modal>
</template>

<script lang="ts">
import { toJSON } from '@ultimicro/json-mapper';
import { BButton } from 'bootstrap-vue';
import Vue from 'vue';
import { ResumeService } from '@/clients/resume';
import { DataProperty, GlobalUpdateResult, MultiplicableData, PropertyFlags, ResumeData, ResumeDataService } from '@/clients/resume-data';
import { TemplateService } from '@/clients/template';
import { TemplateRegistrationService } from '@/clients/template-registration';
import { CreateArg, DataTable, DataType, getDataMetadata, maxEntries, UpdateWriter } from '@/components/data-editor';
import WizardModal, { History, Navigation } from '@/components/wizard-modal';
import { getCommonLanguage, getLanguageTree } from '@/i18n';
import { Source } from '@/store';
import { ULID } from '@/util/ulid';
import { NilUUID, Uuid } from '@/util/uuid';
import ExtractResume from './extract-resume.vue';
import GlobalList from './global-list.vue';
import { FromGlobal, GlobalModalContext, FromResume, ImportField, ImportSource } from './models';

export default Vue.extend({
  components: { BButton, ExtractResume, GlobalList, WizardModal },
  props: {
    context: {
      type: GlobalModalContext,
      required: true
    }
  },
  methods: {
    navigate: function (from: string, result: unknown): Navigation {
      switch (from) {
        case 'source':
          return new Navigation('extract-resume', result, 'extract-resume');
        default:
          throw new Error(`Unknow page ${from}.`);
      }
    },
    complete: async function (histories: History[], result: unknown): Promise<DataTable | undefined> {
      const last = histories[histories.length - 1];

      if (last.page !== 'extract-resume') {
        throw new Error(`Unknown current page '${last.page}'.`);
      }

      // TODO: reduce stress on the server
      const rs = new ResumeService(this.$rest);
      const ds = new ResumeDataService(this.$rest);
      const type = this.context.type;
      const data = last.data as ImportSource;
      const src = data.source;
      const selected = result as ImportField | ImportField[];
      const updated = new DataTable();
      let lang;

      // get source language
      if (src instanceof FromResume) {
        let r, t, tr;

        try {
          r = await rs.get(src.id);
        } catch (e) {
          const err = e as Error;
          this.$error(Source.Server, () => this.$t('resume-editor.message.fetch-resume-error', { resume: src.id.toString(), error: err.message }), err);
          return undefined;
        }

        try {
          const ts = new TemplateService(this.$rest);
          const rs = new TemplateRegistrationService(this.$rest);

          t = await ts.get(new ULID(r.template));
          tr = await rs.get(t.registrationId);
        } catch (e) {
          // TODO: display alert
          return undefined;
        }

        lang = tr.language;
      } else if (src instanceof FromGlobal) {
        lang = src.lang;
      } else {
        throw new Error(`Unknown source ${src}.`);
      }

      // create data for common language
      const common = getCommonLanguage(lang, this.context.lang);
      let ur;

      try {
        ur = await ds.patch(common ? common : 'default', await this.createImport(selected));
      } catch (e) {
        // TODO: display alert
        return undefined;
      }

      updated[common] = [getUpdateData(ur, type)];

      // create global data along the path to the source
      let lt = getLanguageTree(lang);

      if (src instanceof FromGlobal) {
        lt.pop(); // we need to remove the last language otherwise it is going to replace source data
      }

      for (let i = lt.indexOf(common) + 1; i < lt.length; i++) {
        try {
          ur = await ds.patch(lt[i], createFallback(type, ur.updatedData[0].value));
        } catch (e) {
          // TODO: display alert
          return undefined;
        }
      }

      // update exported data to fallback to the parent
      if (src instanceof FromResume) {
        try {
          await rs.patchData(src.id, createExportedUpdate(type, data.data, selected, ur.updatedData[0].value, src.index ?? undefined));
        } catch (e) {
          // TODO: display alert
          return undefined;
        }
      } else if (src instanceof FromGlobal) {
        try {
          await ds.patch(lang ? lang : 'default', createExportedUpdate(type, data.data, selected, ur.updatedData[0].value));
        } catch (e) {
          // TODO: display alert
          return undefined;
        }
      }

      // create global data along the path to context.lang
      lt = getLanguageTree(this.context.lang);
      ur = new GlobalUpdateResult(updated[common], []);

      for (let i = lt.indexOf(common) + 1; i < lt.length; i++) {
        try {
          ur = await ds.patch(lt[i], createFallback(type, ur.updatedData[0].value));
        } catch (e) {
          // TODO: display alert
          return undefined;
        }

        updated[lt[i]] = [getUpdateData(ur, type)];
      }

      return updated;
    },
    createImport: async function (imports: ImportField | ImportField[]): Promise<FormData> {
      const type = this.context.type;
      const update = new FormData();
      const writer = new class extends UpdateWriter {
        getParent(): Uuid | null {
          throw new Error('Method not implemented.');
        }

        writeUpdate(data: object): void {
          update.append(`update:${type}`, new Blob([toJSON(data)], { type: 'application/json' }));
        }

        writeContent(id: string, value: string | Blob): void {
          update.append(`content:${id}`, value);
        }
      };

      switch (type) {
        case DataType.Headline:
        case DataType.Mobile:
        case DataType.Email:
        case DataType.LinkedIn:
        case DataType.GitHub:
        case DataType.Website:
        case DataType.Summary:
          writer.writeUpdate(new DataProperty(PropertyFlags.None, (imports as ImportField).value));
          break;
        case DataType.Name:
        case DataType.Address:
        case DataType.Experience:
        case DataType.Education:
        case DataType.Certificate:
        case DataType.Skill:
        case DataType.Language:
          const meta = getDataMetadata(type);

          if (!meta.create) {
            throw new Error(`Don't know how to create instance of '${type}'.`);
          }

          const args = new Array<CreateArg>();

          if (maxEntries(type) > 1) {
            args.push({ name: 'id', value: NilUUID });
            args.push({ name: 'base', value: null });
          }

          for (const p of meta.props!) {
            const i = (imports as ImportField[]).find(i => i.name === p.name);
            let v;

            if (i) {
              v = new DataProperty(PropertyFlags.None, i.value);
            } else {
              v = new DataProperty(PropertyFlags.Disabled, null);
            }

            args.push({ name: p.name, value: v });
          }

          writer.writeUpdate(meta.create!(args));
          break;
        case DataType.Photo:
          writer.writeUpdate(new DataProperty(PropertyFlags.None, await this.loadContent(writer, (imports as ImportField).value as string)));
          break;
        default:
          throw new Error(`Unknow data type '${type}'.`);
      }

      return update;
    },
    loadContent: async function (writer: UpdateWriter, url: string): Promise<string> {
      const content = await this.$rest.downloadFile(url);
      const id = new Uuid().toString();

      writer.writeContent(id, content);

      return id;
    }
  }
});

function getUpdateData(r: GlobalUpdateResult, type: string): ResumeData {
  if (r.updatedData.length !== 1) {
    throw new Error(`Expected 'updatedData' to contains only single element, got ${r.updatedData.length}.`);
  } else if (r.updatedData[0].type !== type) {
    throw new Error(`Expected 'updatedData[0]' to be '${type}', got '${r.updatedData[0].type}'.`);
  }

  return Object.freeze(r.updatedData[0]);
}

function createFallback(type: string, parent: object): FormData {
  const update = new FormData();
  const writer = new class extends UpdateWriter {
    getParent(): Uuid | null {
      throw new Error('Method not implemented.');
    }

    writeUpdate(data: object): void {
      update.append(`update:${type}`, new Blob([toJSON(data)], { type: 'application/json' }));
    }

    writeContent(id: string, value: string | Blob): void {
      update.append(`content:${id}`, value);
    }
  };

  switch (type) {
    case DataType.Headline:
    case DataType.Mobile:
    case DataType.Email:
    case DataType.LinkedIn:
    case DataType.GitHub:
    case DataType.Photo:
    case DataType.Website:
    case DataType.Summary:
      writer.writeUpdate(new DataProperty(PropertyFlags.None, null));
      break;
    case DataType.Name:
    case DataType.Address:
    case DataType.Experience:
    case DataType.Education:
    case DataType.Certificate:
    case DataType.Skill:
    case DataType.Language:
      const meta = getDataMetadata(type);

      if (!meta.create) {
        throw new Error(`Don't know how to create '${type}'.`);
      }

      const args = new Array<CreateArg>();

      if (maxEntries(type) > 1) {
        args.push({ name: 'id', value: NilUUID });
        args.push({ name: 'base', value: (parent as MultiplicableData).id });
      }

      for (const p of meta.props!) {
        args.push({ name: p.name, value: new DataProperty<string>(PropertyFlags.None, null) });
      }

      writer.writeUpdate(meta.create!(args));
      break;
    default:
      throw new Error(`Unknow data type '${type}'.`);
  }

  return update;
}

function createExportedUpdate(type: string, data: object, imports: ImportField | ImportField[], parent: object, index?: number): FormData {
  const update = new FormData();
  const writer = new class extends UpdateWriter {
    getParent(): Uuid | null {
      throw new Error('Method not implemented.');
    }

    writeUpdate(data: object): void {
      const key = index === undefined ? `update:${type}` : `update:${type}:${index}`;

      update.append(key, new Blob([toJSON(data)], { type: 'application/json' }));
    }

    writeContent(id: string, value: string | Blob): void {
      update.append(`content:${id}`, value);
    }
  };

  switch (type) {
    case DataType.Headline:
    case DataType.Mobile:
    case DataType.Email:
    case DataType.LinkedIn:
    case DataType.GitHub:
    case DataType.Photo:
    case DataType.Website:
    case DataType.Summary:
      writer.writeUpdate(new DataProperty(PropertyFlags.None, null));
      break;
    case DataType.Name:
    case DataType.Address:
    case DataType.Experience:
    case DataType.Education:
    case DataType.Certificate:
    case DataType.Skill:
    case DataType.Language:
      const meta = getDataMetadata(type);

      if (!meta.create) {
        throw new Error(`Don't know how to create instance of '${type}'.`);
      }

      const args = new Array<CreateArg>();

      if (maxEntries(type) > 1) {
        args.push({ name: 'id', value: (data as MultiplicableData).id });
        args.push({ name: 'base', value: (parent as MultiplicableData).id });
      }

      for (const p of meta.props!) {
        const i = (imports as ImportField[]).find(i => i.name === p.name);
        let v;

        if (i) {
          v = new DataProperty(PropertyFlags.None, null);
        } else {
          v = Reflect.get(data, p.name) as DataProperty<any>;
          v.flags &= ~PropertyFlags.Disabled; // set field to fallback to disable of global data instead of keep disable itself
        }

        args.push({ name: p.name, value: v });
      }

      writer.writeUpdate(meta.create!(args));
      break;
    default:
      throw new Error(`Unknow data type '${type}'.`);
  }

  return update;
}
</script>
