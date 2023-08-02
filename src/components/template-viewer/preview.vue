<template>
  <!-- loading -->
  <svg v-if="loading" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="text-anchor: middle" viewBox="0 0 360 470">
    <rect width="100%" height="100%" fill="#6c757d"></rect>
    <text x="50%" y="50%" fill="#dee2e6" dy=".3em">{{ $t('template-viewer.label.preview-loading') }}</text>
  </svg>
  <!-- loaded -->
  <b-card-img v-else-if="image" :src="image.value" :alt="alt"></b-card-img>
  <!-- no preview -->
  <svg v-else xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="text-anchor: middle" viewBox="0 0 360 470">
    <rect width="100%" height="100%" fill="#6c757d"></rect>
    <text x="50%" y="50%" fill="#dee2e6" dy=".3em">{{ $t('account-templates.label.no-preview') }}</text>
  </svg>
</template>

<script lang="ts">
import { BCardImg } from 'bootstrap-vue';
import Vue from 'vue';
import { Source } from '@/store';

export default Vue.extend({
  components: { BCardImg },
  props: {
    url: String,
    alt: String
  },
  data: function () {
    return {
      image: null as ImageURL | null,
      destroyed: false
    };
  },
  computed: {
    loading: function (): boolean {
      if (!this.url) {
        return false;
      } else {
        return this.image === null;
      }
    }
  },
  mounted: async function () {
    if (!this.url) {
      this.$emit('ready');
    } else if (this.$rest.accessToken) {
      let url;

      try {
        url = await this.$rest.getFileURL(this.url);
      } catch (e) {
        const error = e as Error;
        this.$error(Source.Server, () => this.$t('template-viewer.message.preview-load-error', { url: this.url, error }), error);
        return;
      } finally {
        this.$emit('ready');
      }

      if (this.destroyed) {
        URL.revokeObjectURL(url);
      } else {
        this.image = new LocalImage(url);
      }
    } else {
      this.image = new RemoteImage(this.url);
      this.$emit('ready');
    }
  },
  destroyed: function () {
    this.image?.dispose();
    this.destroyed = true;
  }
});

abstract class ImageURL {
  abstract get value(): string;
  abstract dispose(): void;
}

class LocalImage extends ImageURL {
  constructor(private readonly objectURL: string) {
    super();
  }

  get value(): string {
    return this.objectURL;
  }

  dispose(): void {
    URL.revokeObjectURL(this.objectURL);
  }
}

class RemoteImage extends ImageURL {
  constructor(private readonly url: string) {
    super();
  }

  get value(): string {
    return this.url;
  }

  dispose(): void {
  }
}
</script>
