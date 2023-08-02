<template>
  <Modal :title="t('links-manager.label.edit-censorships-title')" initial-busy v3 @shown="shown" @ok="ok" @hidden="hidden" v-slot="{}">
    <BListGroup>
      <CensorshipItem v-for="(item, index) in items" :key="index" :data="item" @input="updateSelection(item, $event)"></CensorshipItem>
    </BListGroup>
  </Modal>
</template>

<script setup lang="ts">
import { BListGroup } from 'bootstrap-vue';
import { ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { ClientKey } from '@/clients/rest';
import { Resume, ResumeService } from '@/clients/resume';
import { DataProperty, ResumeData, ResumeDataService } from '@/clients/resume-data';
import { TemplateService } from '@/clients/template';
import { DataTable, getDataMetadata, getPropertyMetadata, GlobalMap } from '@/components/data-editor';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { DataMerger } from '@/components/parent-selector';
import { getParentLanguage } from '@/i18n';
import { Alert } from '@/services';
import { Source } from '@/store';
import { inject } from '@/util/injector';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';
import CensorshipItem from './censorship-item.vue';
import { CensorshipItem as CensorshipItemData, EditCensorshipsContext } from './models';

const { t } = useI18n();

// props & emit
const props = defineProps({
  context: {
    type: EditCensorshipsContext,
    required: true
  },
  okHook: Function
});

const emit = defineEmits<{
  (e: 'input', v: Set<string>): void;
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// local states
const items: Ref<CensorshipItemData[]> = ref([]);

// functions
const shown = async function (busy: ToggleBusy) {
  // fetch resume
  let resume: Resume;

  try {
    const service = new ResumeService(rest);

    resume = await service.get(new Uuid(props.context.resume.id));
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('links-manager.message.fetch-resume-error', { error }), error);
    busy(false);
    return;
  }

  // fetch template
  let template;

  try {
    const service = new TemplateService(rest);

    template = await service.get(new ULID(resume.template));
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('links-manager.message.fetch-template-error', { template: resume.template, error }), error);
    busy(false);
    return;
  }

  // fetch global data
  const globals = new GlobalMap();
  const ds = new ResumeDataService(rest);

  for (let culture: string | null = resume.culture; culture !== null; culture = getParentLanguage(culture)) {
    const locale = culture || 'default';
    let set;

    try {
      set = await ds.list(locale);
    } catch (e) {
      const error = e as Error;
      alert.error(Source.Server, () => t('links-manager.message.fetch-data-error', { locale, error }), error);
      busy(false);
      return;
    }

    for (const data of set) {
      let table = globals[data.type];

      if (!table) {
        table = globals[data.type] = new DataTable();
      }

      let set = table[culture];

      if (!set) {
        set = table[culture] = [];
      }

      set.push(Object.freeze(data));
    }
  }

  // group resume data
  const groups = new Map<string, ResumeData[]>();

  for (const data of resume.data) {
    let group = groups.get(data.type);

    if (!group) {
      groups.set(data.type, group = []);
    }

    group.push(data);
  }

  // build item list
  for (const type of template.applicableData) {
    const group = groups.get(type);

    if (!group) {
      continue;
    }

    // create item data
    const meta = getDataMetadata(type);

    if (meta.key) {
      const selected = props.context.censorships.has(`${type}.${meta.key}`);
      const data = new Array<unknown>();

      for (const d of group) {
        const m = new DataMerger(d.value as DataProperty<unknown>, resume.culture, globals[type]);
        data.push(m.for(d => d));
      }

      if (data.every(d => d === null)) {
        continue;
      }

      items.value.push(new CensorshipItemData(type, null, selected, data));
    } else if (meta.props) {
      for (const prop of meta.props) {
        const selected = props.context.censorships.has(`${type}.${prop.key}`);
        const data = new Array<unknown>();

        for (const d of group) {
          const m = new DataMerger(d.value as { [p: string]: DataProperty<unknown> }, resume.culture, globals[type]);
          data.push(m.for(d => d[prop.name]));
        }

        if (data.every(d => d === null)) {
          continue;
        }

        items.value.push(new CensorshipItemData(type, prop.name, selected, data));
      }
    } else {
      throw new Error(`Don't know how to handle '${type}' data.`);
    }
  }

  busy(false);
};

const updateSelection = function (i: CensorshipItemData, v: boolean) {
  i.selected = v;
};

const ok = async function (proceed: Proceed, busy: ToggleBusy) {
  // build identifiers
  const censorships = new Set<string>();

  for (const i of items.value) {
    if (i.selected) {
      let id: string;

      if (i.prop) {
        id = `${i.type}.${getPropertyMetadata(i.type, i.prop).key}`;
      } else {
        id = `${i.type}.${getDataMetadata(i.type).key}`;
      }

      censorships.add(id);
    }
  }

  // invoke ok hook
  if (props.okHook) {
    busy(true);

    if (!await props.okHook(censorships)) {
      busy(false);
      return;
    }
  }

  proceed(censorships);
};

const hidden = function (result: unknown) {
  if (result instanceof Set<string>) {
    emit('input', result);
  }

  emit('hidden');
};
</script>
