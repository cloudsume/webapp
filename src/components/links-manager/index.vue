<template>
  <div>
    <!-- list modal -->
    <Modal
      :title="t('manage-resume-links.label.header')"
      size="lg"
      footer-class="justify-content-between"
      initial-busy
      v3
      @shown="shown"
      @hidden="emit('hidden')">
      <!-- body -->
      <template #default="{}">
        <!-- no license alert -->
        <BAlert :show="!downloadable" variant="warning">
          {{ t('links-manager.message.no-license') }}
        </BAlert>
        <!-- link list -->
        <BTable
          :fields="columns"
          :sort-compare="comparer"
          :items="links"
          :empty-text="t('manage-resume-links.message.no-links')"
          primary-key="id"
          sort-by="accessedAt"
          stacked="lg"
          class="mb-0"
          sort-desc
          striped
          outlined
          show-empty>
          <!-- actions cell -->
          <template #cell(actions)="{ item }">
            <BDropdown :text="t('links-manager.label.access-histories')" size="sm" split right block @click="viewingAccesses = item">
              <BDropdownItemButton @click="viewingLink = item">
                {{ t('links-manager.label.view-url') }}
              </BDropdownItemButton>
              <BDropdownItemButton @click="editCensorship(item)">
                {{ t('links-manager.label.edit-censorship') }}
              </BDropdownItemButton>
              <BDropdownDivider></BDropdownDivider>
              <BDropdownItemButton variant="danger" @click="deleting = item">
                {{ t('links-manager.label.delete') }}
              </BDropdownItemButton>
            </BDropdown>
          </template>
        </BTable>
      </template>
      <!-- footer -->
      <template #modal-footer="{ ok }">
        <BButton :disabled="!canCreate" variant="link" class="p-0" @click="creating = props.resume">
          {{ t('create-resume-link.label.button') }}
        </BButton>
        <BButton variant="primary" @click="ok">
          {{ t('close-resume-links.label.button') }}
        </BButton>
      </template>
    </Modal>
    <!-- modals -->
    <CreateModal v-if="creating" :resume="creating" @input="created" @hidden="creating = null"></CreateModal>
    <AccessesViewer :resume-id="props.resume.id" v-model="viewingAccesses"></AccessesViewer>
    <UrlViewer v-if="viewingLink" :link="viewingLink" @hidden="viewingLink = null"></UrlViewer>
    <EditCensorships v-if="editingCensorship"
      :context="editingCensorship"
      :ok-hook="updateCensorship"
      @input="censorshipUpdated"
      @hidden="editingCensorship = null">
    </EditCensorships>
    <DeleteLinkModal :resume-id="props.resume.id" @input="deleted" v-model="deleting"></DeleteLinkModal>
  </div>
</template>

<script setup lang="ts">
import { BAlert, BButton, BDropdown, BDropdownDivider, BDropdownItemButton, BTable } from 'bootstrap-vue';
import { computed, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { ClientKey } from '@/clients/rest';
import { ResumeInfo, ResumeLink, ResumeService } from '@/clients/resume';
import { TemplateService } from '@/clients/template';
import { RegistrationCategory, TemplateLicenseStatus, TemplateRegistrationService } from '@/clients/template-registration';
import Modal, { ToggleBusy } from '@/components/modal';
import { Alert } from '@/services';
import { Session } from '@/state';
import { Source } from '@/store';
import { bind } from '@/util/binder';
import { inject } from '@/util/injector';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';
import AccessesViewer from './accesses-viewer';
import CreateModal from './create-modal.vue';
import DeleteLinkModal from './delete-link';
import EditCensorships from './edit-censorships.vue';
import { EditCensorshipsContext, Link } from './models';
import UrlViewer from './url-viewer.vue';

const { d, t } = useI18n();

// props & emit
const props = defineProps({
  resume: {
    type: ResumeInfo,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'create', l: ResumeLink): void;
  (e: 'delete', l: string): void;
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// global states
const session = inject(Session).value;

if (!session) {
  throw new Error('Link manager required user session.');
}

// local states
const links: Ref<Link[]> = ref([]);
const downloadable = ref(true);
const creating: Ref<ResumeInfo | null> = ref(null);
const viewingAccesses: Ref<Link | undefined> = ref(undefined);
const viewingLink: Ref<Link | null> = ref(null);
const editingCensorship: Ref<EditingCensorship | null> = ref(null);
const deleting: Ref<Link | undefined> = ref(undefined);

// computed
const columns = computed(function () {
  return [
    {
      key: 'name',
      label: t('resume-link-name.label.header'),
      tdClass: 'align-middle'
    },
    {
      key: 'createdAt',
      label: t('resume-link-created-time.label.header'),
      tdClass: 'align-middle',
      sortable: true,
      formatter: (v: Date) => d(v, 'short')
    },
    {
      key: 'accessedAt',
      label: t('resume-link-last-access.label.header'),
      tdClass: 'align-middle',
      sortable: true,
      formatter: (v: Date | null) => v ? d(v, 'short') : t('resume-link-last-access.label.none-table-cell')
    },
    {
      key: 'actions',
      label: t('resume-link-actions.label.header'),
      sortable: false
    }
  ];
});

const canCreate = computed(function () {
  return props.resume.links.length < 10;
});

// functions
const shown = bind({ links, downloadable }, async function (busy: ToggleBusy) {
  // check if user can download this resume
  let downloadable;

  try {
    const ts = new TemplateService(rest);
    const t = await ts.get(new ULID(props.resume.template));

    if (t.category === RegistrationCategory.Paid) {
      const rs = new TemplateRegistrationService(rest);
      const r = await rs.get(t.registrationId);

      if (r.userId.equals(session.userId)) {
        downloadable = true;
      } else {
        const l = await rs.getLicense(r.id);

        downloadable = l?.status === TemplateLicenseStatus.Valid;
      }
    } else {
      downloadable = true;
    }
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('links-manager.message.check-downloadable-error', { error }), error);
    downloadable = false;
  }

  // fetch accesses
  const rs = new ResumeService(rest);
  const links = new Array<Link>();

  for (const l of props.resume.links) {
    let accesses;

    try {
      accesses = await rs.listLinkAccesses(new Uuid(props.resume.id), l.id);
    } catch (e) {
      const error = e as Error;
      alert.error(Source.Server, () => t('links-manager.message.fetch-accesses-error', { error }), error);
      continue;
    }

    const latest = accesses.length ? accesses[0] : null;
    const lastAccess = latest?.id.time ?? null;

    links.push(new Link(l.id, l.name, new Set([...l.censorships]), l.createdAt, lastAccess, accesses));
  }

  // trigger reactivity.
  this.links.value = links;
  this.downloadable.value = downloadable;

  busy(false);
});

const comparer = function (a: Link, b: Link, prop: keyof Link): -1 | 0 | 1 | false | null {
  switch (prop) {
    case 'accessedAt':
      if (!a.accessedAt && !b.accessedAt) {
        return 0;
      } else if (!a.accessedAt || !b.accessedAt) {
        return a.accessedAt ? 1 : -1;
      }
    case 'createdAt':
      if (a[prop]! < b[prop]!) {
        return -1;
      } else if (a[prop]! > b[prop]!) {
        return 1;
      } else {
        return 0;
      }
    default:
      return null;
  }
};

const created = function (l: ResumeLink) {
  links.value.push(new Link(l.id, l.name, new Set([...l.censorships]), l.createdAt, null, []));
  emit('create', l);
};

const editCensorship = function (l: Link) {
  editingCensorship.value = new EditingCensorship(props.resume, l);
};

const updateCensorship = async function (censorships: Set<string>) {
  const ctx = editingCensorship.value;

  if (!ctx) {
    throw new Error('No censorship editing context.');
  }

  try {
    const rs = new ResumeService(rest);
    await rs.setLinkCensorships(new Uuid(ctx.resume.id), ctx.link.id, [...censorships]);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('links-manager.message.update-censorship-error', { error }), error);
    return false;
  }

  return true;
};

const censorshipUpdated = function (censorships: Set<string>) {
  const ctx = editingCensorship.value;

  if (!ctx) {
    throw new Error('No censorship editing context.');
  }

  ctx.link.censorships = censorships;
};

const deleted = function (id: string) {
  const i = links.value.findIndex(l => l.id === id);

  if (i === -1) {
    throw new Error(`Unknow link ${id}.`);
  }

  links.value.splice(i, 1);
  emit('delete', id);
};

// types
class EditingCensorship extends EditCensorshipsContext {
  link: Link;

  constructor(resume: ResumeInfo, link: Link) {
    super(resume, link.censorships);
    this.link = link;
  }
}
</script>
