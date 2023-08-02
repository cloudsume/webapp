<template>
  <Page>
    <!-- list -->
    <CardDeck :items="resumes" primary-key="id" :cols="12" :md="6" :lg="4">
      <!-- resume -->
      <template v-slot="{ item }">
        <BCard class="h-100" no-body>
          <!-- preview -->
          <div class="h-75" style="flex-basis: 0">
            <BCardImg :src="getPreviewURL(item)"></BCardImg>
          </div>
          <!-- details -->
          <div class="h-25 flex-grow-1">
            <BCardBody class="h-100 d-flex flex-column">
              <!-- title -->
              <div class="card-title d-flex justify-content-between align-items-center">
                <!-- name -->
                <h5 class="mb-0">{{ getName(item) }}</h5>
                <!-- actions -->
                <BDropdown variant="link" toggle-class="p-0" no-caret right no-flip>
                  <!-- share -->
                  <BDropdownItemButton @click="managingLinks = item">
                    {{ t('share-resume.label.menu-item') }}
                  </BDropdownItemButton>
                  <BDropdownDivider></BDropdownDivider>
                  <!-- delete -->
                  <BDropdownItemButton variant="danger" @click="deleting = item">
                    {{ t('delete-resume.label.link') }}
                  </BDropdownItemButton>
                  <!-- dropdown icon -->
                  <template #button-content>
                    <BIconThreeDotsVertical></BIconThreeDotsVertical>
                  </template>
                </BDropdown>
              </div>
              <!-- details -->
              <ul class="list-unstyled">
                <!-- template -->
                <li class="text-truncate">
                  <BIconFileEarmarkCode></BIconFileEarmarkCode>
                  {{ getTemplateName(item) }}
                </li>
                <!-- stats -->
                <li v-if="hasLinks(item)">
                  <BIconEye></BIconEye>
                  {{ getLastAccessByLink(item) }}
                </li>
                <!-- locale -->
                <li>
                  <BIconGlobe></BIconGlobe>
                  {{ getTemplateLanguage(item) }}
                </li>
              </ul>
              <!-- primary actions -->
              <div class="mt-auto">
                <BLink class="card-link" :to="{ name: 'edit-resume', params: { id: getID(item) } }">
                  {{ t('edit-resume.label.link') }}
                </BLink>
                <BLink class="card-link" @click="downloading = item">
                  {{ t('download-resume.label.link') }}
                </BLink>
              </div>
            </BCardBody>
          </div>
        </BCard>
      </template>
      <!-- new -->
      <template #footer>
        <BCard class="h-100" no-body>
          <BCardBody class="d-flex flex-column" :title="t('new-resume.label.header')">
            <BCardText>{{ t('new-resume.message.description') }}</BCardText>
            <div class="mt-auto">
              <BLink class="card-link" :to="{ name: 'template-list' }">
                {{ t('new-resume.label.link') }}
              </BLink>
            </div>
          </BCardBody>
        </BCard>
      </template>
    </CardDeck>
    <!-- modals -->
    <TransferModal v-if="transferring === 'in-progress'" @hidden="transferring = $event === 'conflict' ? 'conflict' : 'cancel'"></TransferModal>
    <TransferConflict v-else-if="transferring === 'conflict'" @hidden="transferring = 'cancel'"></TransferConflict>
    <CancelTransfer v-else-if="transferring === 'cancel'" @hidden="transferring = 'in-progress'"></CancelTransfer>
    <WelcomeModal v-else-if="welcomeDisplayed === false" @hidden="welcomeHidden"></WelcomeModal>
    <template v-if="downloading">
      <Downloader v-if="canDownload(downloading)"
        :resume="downloading"
        @recruitment-consent="recruitmentConsentUpdated(downloading, $event)"
        @hidden="downloading = null">
      </Downloader>
      <PurchaseTemplate v-else :resume="downloading" :return-url="getPurchaseReturnURL(downloading)" @hidden="downloading = null"></PurchaseTemplate>
    </template>
    <LinksManager v-if="managingLinks" :resume="managingLinks" @create="linkCreated" @delete="linkDeleted" @hidden="managingLinks = null"></LinksManager>
    <FormModal
      :title="t('delete-resume.label.header')"
      :cancel-title="t('cancel-delete-resume.label.button')"
      :ok-title="t('confirm-delete-resume.label.button')"
      @submit="deleteResume"
      @complete="resumeDeleted"
      ok-variant="danger"
      v-model="deleting"
      v-slot="{ data }">
      {{ t('delete-resume.message.description', { name: getName(data) }) }}
    </FormModal>
  </Page>
</template>

<script setup lang="ts">
import {
  BCard,
  BCardBody,
  BCardImg,
  BCardText,
  BDropdown,
  BDropdownDivider,
  BDropdownItemButton,
  BIconEye,
  BIconFileEarmarkCode,
  BIconGlobe,
  BIconThreeDotsVertical,
  BLink
} from 'bootstrap-vue';
import { onUnmounted, ref, Ref } from 'vue';
import { ClientKey } from '@/clients/rest';
import { ResumeLink, ResumeService, ResumeSummary } from '@/clients/resume';
import { Template, TemplateService } from '@/clients/template';
import { RegistrationCategory, TemplateLicense, TemplateLicenseStatus, TemplateRegistrationService } from '@/clients/template-registration';
import CardDeck from '@/components/card-deck';
import FormModal from '@/components/form-modal';
import LinksManager from '@/components/links-manager';
import Page from '@/components/page';
import PurchaseTemplate from '@/components/purchase-template';
import Downloader from '@/components/resume-downloader';
import { StorageKey } from '@/config';
import { getLanguageName, useTranslation } from '@/i18n';
import { Alert, Router } from '@/services';
import { Locale, Session } from '@/state';
import { Source } from '@/store';
import { asyncInit } from '@/util/async-init';
import { inject } from '@/util/injector';
import { ULID } from '@/util/ulid';
import { Uuid } from '@/util/uuid';
import CancelTransfer from './cancel-transfer.vue';
import { TemplateInfo } from './models';
import TransferConflict from './transfer-conflict.vue';
import TransferModal from './transfer-modal.vue';
import WelcomeModal from './welcome-modal.vue';

const { t, d } = useTranslation();

// props & emit
const props = defineProps({
  purchaseResume: String,
  stripePayment: String,
  stripeSecret: String
});

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);
const router = inject(Router);

// global states
const locale = inject(Locale);
const session = inject(Session);

// local states
const resumes: Ref<ResumeSummary[]> = ref([]);
const managingLinks: Ref<ResumeSummary | null> = ref(null);
const deleting: Ref<ResumeSummary | undefined> = ref(undefined);
const downloading: Ref<ResumeSummary | null> = ref(null);
const welcomeDisplayed: Ref<boolean | null> = ref(null);
const transferring: Ref<'in-progress' | 'cancel' | 'conflict' | null> = ref(null);
const templates = new Map<string, TemplateInfo>(); // key is template id, not registration id
const licenses = new Map<string, TemplateLicense>(); // key is registration id

// functions
const getPreviewURL = function (r: ResumeSummary) {
  return r.image;
};

const getName = function (r: ResumeSummary) {
  return r.name;
};

const getTemplate = function (id: string) {
  const template = templates.get(id);

  if (!template) {
    throw new Error(`Unknow template ${id}.`);
  }

  return template;
};

const getTemplateName = function (r: ResumeSummary) {
  return getTemplate(r.template).name;
};

const hasLinks = function (r: ResumeSummary) {
  return r.links.length !== 0;
};

const getLastAccessByLink = function (r: ResumeSummary) {
  let latest: Date | undefined;

  for (const link of r.links) {
    const accessed = link.accessedAt;

    if (!accessed) {
      continue;
    } else if (!latest || accessed > latest) {
      latest = accessed;
    }
  }

  return latest ? d(latest, 'short') : t('resume-list.label.no-accesses');
};

const getTemplateLanguage = function (r: ResumeSummary) {
  return getLanguageName(getTemplate(r.template).locale, locale.value);
};

const getID = function (r: ResumeSummary) {
  return r.id;
};

const welcomeHidden = function () {
  try {
    localStorage.setItem(StorageKey.WelcomeDisplayed, 'true');
  } catch (e) {
    console.error(e);
  }

  welcomeDisplayed.value = true;
};

const canDownload = function (r: ResumeSummary) {
  // check template category
  const t = getTemplate(r.template);

  if (t.category !== RegistrationCategory.Paid) {
    return true;
  }

  const s = session.value;

  if (!s) {
    return false;
  }

  // check owner
  if (t.user.equals(s.userId)) {
    return true;
  }

  // check license
  const l = licenses.get(t.registrationId.toString());

  if (l?.status === TemplateLicenseStatus.Valid) {
    return true;
  }

  return false;
};

const getPurchaseReturnURL = function (r: ResumeSummary) {
  return `${process.env.BASE_URI}${router.currentRoute.path}?purchase-resume=${r.id}`;
};

const linkCreated = function (l: ResumeLink) {
  const resume = managingLinks.value;

  if (!resume) {
    throw new Error('No resume being manaing links.');
  }

  resume.links.push(l);
}

const linkDeleted = function (id: string) {
  const resume = managingLinks.value;

  if (!resume) {
    throw new Error('No resume being manaing links.');
  }

  const i = resume.links.findIndex(l => l.id === id);

  if (i === -1) {
    throw new Error(`Unknow link ${id} on resume ${resume.id}.`);
  }

  resume.links.splice(i, 1);
}

const recruitmentConsentUpdated = function (r: ResumeSummary, v: boolean) {
  r.recruitmentConsent = v;
};

const deleteResume = async function (complete: (result?: any) => void) {
  if (!deleting.value) {
    throw new Error('No selected resume to delete.');
  }

  const service = new ResumeService(rest);
  const target = deleting.value.id;

  try {
    await service.delete(new Uuid(target));
  } catch (e) {
    alert.error(Source.Server, () => t('delete-resume.message.delete-error'), e as Error);
    complete();
    return;
  }

  complete(target);
};

const resumeDeleted = function (id: string) {
  const index = resumes.value.findIndex(r => r.id === id);

  if (index === -1) {
    throw new Error(`Unknow resume ${id}.`);
  }

  const deleted = resumes.value.splice(index, 1)[0];

  URL.revokeObjectURL(deleted.image);
};

// lifecycle hooks
onUnmounted(function () {
  for (const r of resumes.value) {
    URL.revokeObjectURL(r.image);
  }
});

asyncInit(async function () {
  // fetch resumes
  let resumes: ResumeSummary[];

  try {
    const rs = new ResumeService(rest);

    resumes = await rs.list();
  } catch (e) {
    alert.error(Source.Server, () => t('my-resumes.message.fetch-error'), e as Error);
    return;
  }

  // fetch template information
  const ts = new TemplateService(rest);
  const rs = new TemplateRegistrationService(rest);
  const templates = new Array<Promise<void>>();
  const paids = new Set<string>();
  const fetchTemplate = async (id: string) => {
    try {
      const t = await ts.get(new ULID(id));
      const r = await rs.get(t.registrationId);

      this.templates.set(id, {
        registrationId: r.id,
        user: r.userId,
        name: r.name,
        category: t.category,
        locale: r.language
      });

      if (t.category === RegistrationCategory.Paid) {
        paids.add(t.registrationId.toString());
      }
    } catch (e) {
      const error = e as Error;
      alert.error(Source.Server, () => t('resume-list.message.fetch-template-error', { template: id, error }), error);
    }
  };

  for (const tid of [...new Set(resumes.map(r => r.template))]) {
    templates.push(fetchTemplate(tid));
  }

  await Promise.all(templates);

  // fetch template licenses
  const licenses = new Array<Promise<void>>();
  const fetchLicense = async (reg: string) => {
    let l;

    try {
      l = await rs.getLicense(new Uuid(reg));
    } catch (e) {
      const error = e as Error;
      alert.error(Source.Server, () => t('resume-list.message.fetch-license-error', { template: reg, error }), error);
    }

    if (l) {
      this.licenses.set(l.registrationId.toString(), l);
    }
  };

  for (const reg of paids) {
    licenses.push(fetchLicense(reg));
  }

  await Promise.all(licenses);

  // show alert if redirected from payment provider
  if (props.purchaseResume) {
    const resume = resumes.find(r => r.id === props.purchaseResume);

    if (!resume) {
      throw new Error(`Unknown resume ${props.purchaseResume}.`);
    }

    const template = this.templates.get(resume.template);

    if (!template) {
      throw new Error(`No template data for resume ${resume.id}.`);
    }

    const license = this.licenses.get(template.registrationId.toString());

    if (license?.status === TemplateLicenseStatus.Valid) {
      alert.success(Source.App, () => t('resume-list.message.template-purchase-success', { template: template.name, resume: resume.name }));
    } else {
      alert.error(Source.App, () => t('resume-list.message.template-purchase-failed'));
    }
  }

  // get welcome displayed flag
  const welcomeDisplayed = localStorage.getItem(StorageKey.WelcomeDisplayed);

  // fetch thumbnails as the last step so we don't need to clean up the object urls if something wrong
  const thumbnails = new Array<Promise<void>>();
  const fetchThumbnail = async function (i: number) {
    let object;

    try {
      object = await rest.getFileURL(resumes[i].image);
    } catch (e) {
      const error = e as Error;
      alert.error(Source.Server, () => t('resume-list.message.fetch-thumbnail-error', { resume: resumes[i].name, error }), error);
      object = '';
    }

    resumes[i].image = object;
  };

  for (let i = 0; i < resumes.length; i++) {
    thumbnails.push(fetchThumbnail(i));
  }

  await Promise.all(thumbnails);

  if (resumes.some(r => !r.image)) {
    for (const r of resumes) {
      if (r.image) {
        URL.revokeObjectURL(r.image);
      }
    }
    return;
  }

  // trigger reactivity
  this.resumes.value = resumes;

  if (session.value?.guest && session.value.account) {
    transferring.value = 'in-progress';
  } else {
    this.welcomeDisplayed.value = welcomeDisplayed === 'true';
  }
}, { resumes, welcomeDisplayed, templates, licenses });
</script>
