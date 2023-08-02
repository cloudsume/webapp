<template>
  <Modal
    :title="$t('template-editor.label.preview-job-title')"
    body-class="pb-0"
    :ok-disabled="!changed"
    initial-busy
    v3
    @show="populate"
    @ok="save"
    @hidden="hidden"
    v-slot="{ ok }">
    <BForm @submit.prevent="ok()">
      <BFormGroup
        :label="$t('template-editor.label.preview-job-job')"
        :description="$t('template-editor.message.preview-job-description')"
        label-for="preview-job-job">
        <BFormSelect id="preview-job-job" :options="jobs" v-model="job"></BFormSelect>
      </BFormGroup>
    </BForm>
  </Modal>
</template>

<script lang="ts">
import { BForm, BFormGroup, BFormSelect } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { TemplateRegistrationService } from '@/clients/template-registration';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { JobEndpoint } from '@/rest-endpoints/job';
import { Source } from '@/store';
import { Uuid } from '@/util/uuid';
import { PageComponent } from './component';

export default (Vue as VueConstructor<PageComponent>).extend({
  components: { BForm, BFormGroup, BFormSelect, Modal },
  mixins: [PageComponent],
  data: function () {
    return {
      jobs: new Array<JobItem>(),
      job: ''
    };
  },
  computed: {
    jobChanged: function (): boolean {
      const previous = this.context.previewJob?.toString() ?? '';

      return this.job !== previous;
    },
    changed: function (): boolean {
      return this.jobChanged;
    }
  },
  methods: {
    populate: async function (busy: ToggleBusy): Promise<void> {
      // load applicable jobs
      const ep = new JobEndpoint(this.$rest);
      const registration = this.context.registration;
      const jobs = new Array<JobItem>();

      if (!registration) {
        throw new Error('Template registration is not loaded.');
      }

      for (const id of registration.applicableJobs) {
        let job;

        try {
          job = await ep.get(id);
        } catch (e) {
          const error = e as Error;
          this.$error(Source.Server, () => this.$t('template-editor.message.load-job-error', { id, error }), error);
          busy(false);
          return;
        }

        jobs.push({ text: job.name, value: id.toString() });
      }

      // trigger reactivity
      const locale = this.$store.state.locale;

      this.jobs = jobs.sort((a, b) => a.text.localeCompare(b.text, locale));
      this.jobs.unshift({ text: this.$t('template-editor.label.preview-job-unspecify') as string, value: '' });
      this.job = this.context.previewJob?.toString() ?? '';

      busy(false);
    },
    save: async function (proceed: Proceed, busy: ToggleBusy): Promise<void> {
      if (!this.changed) {
        return;
      }

      // invoke api
      const service = new TemplateRegistrationService(this.$rest);
      const job = this.job ? new Uuid(this.job) : null;
      const registration = this.context.registration;

      if (!registration) {
        throw new Error('Template registration is not loaded.');
      }

      busy(true);

      try {
        await service.writeWorkspacePreviewJob(registration.id, job);
      } catch (e) {
        const error = e as Error;
        this.$error(Source.Server, () => this.$t('template-editor.message.preview-job-update-error', { error }), error);
        busy(false);
        return;
      }

      proceed(job);
    },
    hidden: function (job: Uuid | null | undefined): void {
      if (job !== undefined) {
        this.$emit('input', job);
      }

      this.$emit('hidden');
    }
  }
});

interface JobItem {
  text: string;
  value: string;
}
</script>
