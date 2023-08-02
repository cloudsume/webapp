<template>
  <b-form-row>
    <!-- preview -->
    <b-col lg="6">
      <!-- loading -->
      <div v-if="!preview" :class="previewClass">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="text-anchor: middle" viewBox="0 0 360 470">
          <rect width="100%" height="100%" fill="#6c757d"></rect>
          <text x="50%" y="50%" fill="#dee2e6" dy=".3em">{{ $t('template-viewer.label.preview-loading') }}</text>
        </svg>
      </div>
      <!-- loaded -->
      <b-img v-else :src="preview.url" :alt="name" :class="previewClass" fluid thumbnail></b-img>
    </b-col>
    <!-- details -->
    <b-col lg="6" class="d-flex flex-column">
      <b-card class="flex-grow-1" :class="detailsClass" no-body>
        <b-tabs class="flex-grow-1 d-flex flex-column" nav-class="flex-nowrap" content-class="flex-grow-1" card pills no-fade>
          <!-- description -->
          <b-tab :title="$t('template-details.label.description')" title-link-class="text-nowrap" no-body>
            <div class="card-body" v-html="description"></div>
          </b-tab>
          <b-tab :title="$t('template-details.label.changes')" title-link-class="text-nowrap" class="h-100" no-body lazy v-slot="{}">
            <!-- TODO: make component keep alive -->
            <history-list :registration-id="id"></history-list>
          </b-tab>
          <!-- b-tab :title="$t('template-details.label.reviews')" title-link-class="text-nowrap"></b-tab -->
          <b-tab :title="$t('template-details.label.information')" title-link-class="text-nowrap" lazy v-slot="{}">
            <template-info :data="data" :show-resume-count="showResumeCount" :show-locale="showLocale"></template-info>
          </b-tab>
        </b-tabs>
      </b-card>
    </b-col>
  </b-form-row>
</template>

<style lang="scss" scoped>
@import '~@/styles/bootstrap';

.tabs:deep(> .card-header) {
  overflow-x: auto;
  padding-left: 0;
  padding-right: 0;
}

.tabs:deep(> .card-header > .nav) {
  display: inline-flex;
  margin-left: $card-spacer-x / 2;
  margin-right: $card-spacer-x / 2;
}

.card-body:deep(> :last-child) {
  margin-bottom: 0;
}
</style>

<script lang="ts">
import { BCard, BCol, BFormRow, BImg, BTab, BTabs } from 'bootstrap-vue';
import { sanitize } from 'dompurify';
import { marked } from 'marked';
import Vue from 'vue';
import TemplateInfo from '@/components/template-info';
import { Template } from '@/components/template-viewer';
import { Source } from '@/store';
import { Uuid } from '@/util/uuid';
import HistoryList from './history-list.vue';

export default Vue.extend({
  components: { BCard, BCol, BFormRow, BImg, BTab, BTabs, HistoryList, TemplateInfo },
  props: {
    data: {
      type: Template,
      required: true
    },
    previewClass: {
      type: String,
      default: 'mb-3'
    },
    detailsClass: {
      type: String,
      default: 'mb-3'
    },
    showResumeCount: Boolean,
    showLocale: Boolean
  },
  data: function () {
    return {
      preview: null as Preview | null,
      destroyed: false
    };
  },
  computed: {
    id: function (): Uuid {
      return this.data.id;
    },
    name: function (): string {
      return this.data.name;
    },
    description: function (): string {
      let html;

      if (this.data.description) {
        html = marked.parse(this.data.description, {
          headerPrefix: 'template-description-',
          silent: true
        });
      } else {
        html = this.data.name;
      }

      return sanitize(html);
    }
  },
  mounted: async function () {
    const url = this.data.preview;
    let preview: Preview;

    if (url === null) {
      throw new Error(`Template ${this.data.id} does not have a preview.`);
    } else if (this.$rest.accessToken) {
      let object;

      try {
        object = await this.$rest.getFileURL(url);
      } catch (e) {
        const error = e as Error;
        this.$error(Source.Server, () => this.$t('template-details.message.preview-load-error', { url, error }), error);
        return;
      }

      if (this.destroyed) {
        URL.revokeObjectURL(object);
        return;
      }

      preview = new LocalPreview(object);
    } else {
      preview = new RemotePreview(url);
    }

    this.preview = preview;
  },
  destroyed: function () {
    this.preview?.dispose();
    this.destroyed = true;
  }
});

abstract class Preview {
  abstract get url(): string;
  abstract dispose(): void;
}

class LocalPreview extends Preview {
  constructor(private readonly object: string) {
    super();
  }

  get url(): string {
    return this.object;
  }

  dispose(): void {
    URL.revokeObjectURL(this.object);
  }
}

class RemotePreview extends Preview {
  constructor(private readonly value: string) {
    super();
  }

  get url(): string {
    return this.value;
  }

  dispose(): void {
  }
}
</script>
