<template>
  <div>
    <!-- empty -->
    <div v-if="!templates.length && !fetching" class="text-center mb-3">
      {{ t('template-browser.message.no-templates') }}
    </div>
    <!-- list -->
    <CardDeck v-else-if="templates.length" :items="templates" :primary-key="cardId" :cols="cols" :sm="sm" :md="md" :lg="lg" :xl="xl">
      <!-- template -->
      <template #default="{ item }">
        <TemplateViewer :data="item" class="h-100" show-locale clickable-preview @preview="viewingDetails = item">
          <slot :template="item"></slot>
        </TemplateViewer>
      </template>
    </CardDeck>
    <!-- load more -->
    <div v-if="fetching" class="text-center mb-3">
      <BSpinner></BSpinner>
    </div>
    <BButton v-else-if="!fulfilled" class="mb-3" variant="link" block @click="next()">
      <BIconChevronDoubleDown></BIconChevronDoubleDown>
    </BButton>
    <!-- modals -->
    <DetailsModal v-if="viewingDetails"
      :template="viewingDetails"
      :show-create-resume="showCreateResume"
      :resume-count="resumeCount"
      @hidden="viewingDetails = null">
    </DetailsModal>
  </div>
</template>

<script setup lang="ts">
import { BButton, BIconChevronDoubleDown, BSpinner } from 'bootstrap-vue';
import { onMounted, ref, Ref, watch } from 'vue';
import { ClientKey } from '@/clients/rest';
import { TemplateService } from '@/clients/template';
import { RegistrationCategory, TemplateRegistration, TemplateRegistrationService } from '@/clients/template-registration';
import CardDeck from '@/components/card-deck';
import TemplateViewer, { Template } from '@/components/template-viewer';
import { useTranslation } from '@/i18n';
import { Alert } from '@/services';
import { Session } from '@/state';
import { Source } from '@/store';
import { bind } from '@/util/binder';
import { inject } from '@/util/injector';
import DetailsModal from './details-modal.vue';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  cols: [Number, String],
  sm: [Number, String],
  md: [Number, String],
  lg: [Number, String],
  xl: [Number, String],
  filter: Function,
  showCreateResume: Boolean,
  resumeCount: Number
});

const emit = defineEmits<{
  (e: 'fetching', v: boolean): void;
  (e: 'ready', regs: TemplateRegistration[] | null): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// global states
const session = inject(Session);

// local states
const fetching = ref(false);
let registrations = new Array<TemplateRegistration>();
let index = 0;
const templates: Ref<Template[]> = ref([]);
const fulfilled = ref(false);
const viewingDetails: Ref<Template | null> = ref(null);

// functions
const cardId = function (t: Template): string | number {
  return t.id.toString();
};

const setFetching = function (v: boolean) {
  if (v !== fetching.value) {
    fetching.value = v;
    emit('fetching', v);
  }
};

const next = bind({ templates }, async function () {
  setFetching(true);

  // all item fulfilled
  if (index >= registrations.length) {
    fulfilled.value = true;
    setFetching(false);
    return;
  }

  // setup fetcher
  const rs = new TemplateRegistrationService(rest);
  const ts = new TemplateService(rest);
  const fetch = async function (registration: TemplateRegistration) {
    const id = registration.id;
    const tid = registration.latestRelease;

    try {
      if (!tid) {
        throw new Error(`No any releases for template ${id}.`);
      }

      const template = await ts.get(tid);
      let license;

      if (template.category === RegistrationCategory.Paid && session.value) {
        try {
          license = await rs.getLicense(template.registrationId);
        } catch (e) {
          const error = e as Error;
          alert.error(Source.Server, () => t('template-browser.message.fetch-license-error', { template: template.registrationId, error }), error);
          license = null;
        }
      } else {
        license = null;
      }

      return new Template(
        id,
        registration.userId,
        registration.name,
        registration.description,
        registration.website,
        registration.language,
        template.category,
        registration.prices,
        registration.resumeCount,
        template.id,
        template.previews[0],
        license);
    } catch (e) {
      const error = e as Error;
      alert.error(Source.Server, () => t('template-browser.message.fetch-template-error', { template: id, error }), error);
      return null;
    }
  };

  // populate template list
  const templates = new Array<Promise<Template | null>>();
  let i;

  for (i = index; i < registrations.length && templates.length < 6; i++) {
    const r = registrations[i];

    if (props.filter && !props.filter(r)) {
      continue;
    }

    templates.push(fetch(r));
  }

  for (const t of await Promise.all(templates)) {
    if (!t) {
      continue;
    }

    this.templates.value.push(t);
  }

  index = i;
  setFetching(false);

  // check if no more templates
  if (index >= registrations.length) {
    fulfilled.value = true;
  }
});

// lifecycle hooks
onMounted(async function () {
  const service = new TemplateRegistrationService(rest);

  // load registrations
  setFetching(true);

  try {
    registrations = (await service.list()).filter(r => r.latestRelease !== null);
  } catch (e) {
    // TODO: display alert
    setFetching(false);
    emit('ready', null);
    return;
  }

  // sort least used template first
  registrations.sort((a, b) => a.resumeCount - b.resumeCount);

  // populate the first page
  await next();
  emit('ready', registrations);
});

// watches
watch(() => props.filter, function () {
  if (fetching.value) {
    return;
  }

  templates.value = [];
  index = 0;
  fulfilled.value = false;
  next();
});
</script>
