<template>
  <!-- loading -->
  <div v-if="loading" class="h-100 d-flex flex-column justify-content-center align-items-center" style="min-height: 150px">
    <b-spinner class="align-middle"></b-spinner>
  </div>
  <!-- content -->
  <div v-else class="card-body accordion">
    <b-card v-for="(t, i) of templates" :key="getKey(t)" no-body>
      <!-- toggle -->
      <b-card-header>
        <b-button variant="link" class="text-left p-0" block v-b-toggle="getID(t)">
          {{ getTitle(t) }}
        </b-button>
      </b-card-header>
      <!-- release note -->
      <b-collapse :id="getID(t)" :visible="i === 0" accordion="template-histories">
        <div class="card-body release-note" v-html="getReleaseNote(t, i)"></div>
      </b-collapse>
    </b-card>
  </div>
</template>

<style lang="scss" scoped>
.release-note:deep(> :last-child) {
  margin-bottom: 0;
}
</style>

<script lang="ts">
import { BButton, BCard, BCardHeader, BCollapse, BSpinner, VBToggle } from 'bootstrap-vue';
import { sanitize } from 'dompurify';
import { marked } from 'marked';
import Vue from 'vue';
import { TemplateRegistrationService, TemplateSummary } from '@/clients/template-registration';
import { Source } from '@/store';
import { Uuid } from '@/util/uuid';

export default Vue.extend({
  components: { BButton, BCard, BCardHeader, BCollapse, BSpinner },
  directives: {
    'b-toggle': VBToggle
  },
  props: {
    registrationId: {
      type: Uuid,
      required: true
    }
  },
  data: function () {
    return {
      loading: true,
      templates: new Array<TemplateSummary>()
    };
  },
  mounted: async function () {
    const service = new TemplateRegistrationService(this.$rest);
    let templates;

    try {
      templates = await service.listReleases(this.registrationId);
    } catch (e) {
      const error = e as Error;
      const message = () => this.$t('template-details.message.load-releases-error', { template: this.registrationId.toString(), error: error.message });
      this.$error(Source.Server, message, error);
      return;
    } finally {
      this.loading = false;
    }

    this.templates = templates;
  },
  methods: {
    getKey: function (t: TemplateSummary): string {
      return t.id.toString();
    },
    getID: function (t: TemplateSummary): string {
      return `template-history-${t.id}`;
    },
    getTitle: function (t: TemplateSummary): string {
      return this.$d(t.id.time, 'short');
    },
    getReleaseNote: function (t: TemplateSummary, i: number): string {
      let note: string;

      if (i === this.templates.length - 1) {
        note = this.$t('template-details.message.initial-release') as string;
      } else {
        note = t.releaseNote;
      }

      const md = marked.parse(note, {
        headerPrefix: 'template-history-',
        silent: true
      });

      return sanitize(md);
    }
  }
});
</script>
