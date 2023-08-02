<template>
  <div>
    <!-- choices modal -->
    <Modal
      :title="t('download-resume.label.header')"
      hide-footer
      v3
      @ok="choiceOK"
      @hidden="choiceHidden"
      v-slot="{ ok }">
      <!-- share agreement -->
      <p>{{ t('resume-downloader.message.share-agreement') }}</p>
      <!-- choices -->
      <BButton variant="outline-primary" block @click="ok(true)">
        {{ t('resume-downloader.label.share-button') }}
      </BButton>
      <BButton variant="outline-primary" block @click="ok(false)">
        {{ t('resume-downloader.label.decline-button') }}
      </BButton>
    </Modal>
    <!-- building modal -->
    <Modal v-if="building"
      :title="t('download-resume.label.header')"
      :cancel-disabled="!link"
      :ok-title="t('save-downloaded-resume.label.button')"
      :ok-disabled="!link"
      hide-header-close
      no-close-on-backdrop
      no-close-on-esc
      v3
      @shown="start"
      @ok="save"
      @hidden="free"
      v-slot="{}">
      <BProgress :animated="!link" max="100">
        <BProgressBar :label="status" value="100"></BProgressBar>
      </BProgress>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { BButton, BProgress, BProgressBar } from 'bootstrap-vue';
import { ref, Ref } from 'vue';
import { ClientKey } from '@/clients/rest';
import { ResumeInfo, ResumeService } from '@/clients/resume';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { useTranslation } from '@/i18n';
import { Alert } from '@/services';
import { Source } from '@/store';
import { bind } from '@/util/binder';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';
import { Uuid } from '@/util/uuid';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  resume: {
    type: ResumeInfo,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'recruitment-consent', v: boolean): void;
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);
const rest = inject(ClientKey);

// local states
const building = ref(false);
const received = ref(-1);
const link: Ref<HTMLAnchorElement | null> = ref(null);

// computed
const id = computed(function (): Uuid {
  return new Uuid(props.resume.id);
});

const status = computed(function (): string {
  if (link.value) {
    return t('resume-downloaded.label.progress');
  } else if (received.value < 0) {
    return t('building-resume.label.progress');
  } else {
    return t('downloading-resume.label.progress');
  }
});

// functions
const choiceOK = async function (proceed: Proceed, busy: ToggleBusy, result: unknown) {
  // check if we need to update recruitment consent
  if (result !== props.resume.recruitmentConsent) {
    const consent = !props.resume.recruitmentConsent;

    busy(true);

    try {
      const rs = new ResumeService(rest);
      await rs.setRecruitmentConsent(id.value, consent);
    } catch (e) {
      const error = e as Error;
      alert.error(Source.Server, () => t('resume-downloader.message.consent-error', { error }), error);
      busy(false);
      return;
    }

    emit('recruitment-consent', consent);
  }

  // show download modal
  proceed();
};

const choiceHidden = function (result: unknown) {
  if (result !== undefined) {
    building.value = true;
  } else {
    emit('hidden');
  }
};

const start = bind({ link }, async function () {
  const service = new ResumeService(rest);

  // download
  let url;

  try {
    url = await service.download(new Uuid(props.resume.id), r => received.value += r);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.Server, () => t('resume-downloader.message.error', { error }), error);
    return;
  }

  // create anchor element for url
  const link = document.createElement('a');

  link.href = url;
  link.download = `${props.resume.name}.pdf`;

  document.body.appendChild(this.link.value = link);
});

const save = bind({ link }, function (proceed: Proceed) {
  const link = this.link.value;

  if (!link) {
    throw new Error('Download still in progress.');
  }

  link.click();
  proceed();
});

const free = bind({ link }, function () {
  const link = this.link.value;

  if (link) {
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  emit('hidden');
});
</script>
