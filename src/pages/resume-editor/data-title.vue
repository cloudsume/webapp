<template>
  <div class="d-flex justify-content-between">
    <!-- title -->
    <b-button v-if="entry.state" variant="link" class="text-left p-0" block v-b-toggle="toggleTarget">
      {{ text }}
    </b-button>
    <div v-else>
      {{ text }}
    </div>
    <!-- indicator -->
    <div class="d-flex align-items-center ml-2" v-if="hasError">
      <b-icon icon="exclamation-triangle-fill" variant="warning"></b-icon>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { TranslateResult } from 'vue-i18n';
import { DataFlags, getDataMetadata } from '@/components/data-editor';
import { PageComponent } from './component';
import { DataEntry } from './models';

export default (Vue as VueConstructor<PageComponent>).extend({
  mixins: [PageComponent],
  props: {
    entry: {
      type: DataEntry,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    toggleTarget: {
      type: String,
      required: true
    }
  },
  computed: {
    text: function (): TranslateResult {
      return getDataMetadata(this.entry.type).label(this.$i18n, this.entry.state ? this.index + 1 : undefined);
    },
    hasError: function (): boolean {
      const s = this.entry.state;

      if (s) {
        return (s.flags & DataFlags.Error) !== 0;
      } else {
        return false;
      }
    }
  }
});
</script>
