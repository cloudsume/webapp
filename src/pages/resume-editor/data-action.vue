<template>
  <div>
    <b-button v-if="swapable" :disabled="context.saving || !canUp" @click="$emit('up')">
      <b-icon icon="chevron-up"></b-icon>
    </b-button>
    <b-button v-if="swapable" :disabled="context.saving || !canDown" @click="$emit('down')">
      <b-icon icon="chevron-down"></b-icon>
    </b-button>
    <b-button v-if="entry.state" :disabled="context.saving" variant="danger" @click="$emit('delete')">
      <b-icon icon="trash"></b-icon>
    </b-button>
    <b-button v-else :disabled="context.saving" @click="$emit('create')">
      <b-icon icon="plus"></b-icon>
    </b-button>
  </div>
</template>

<script lang="ts">
import { BButton, BIcon, BIconChevronDown, BIconChevronUp } from 'bootstrap-vue';
import Vue from 'vue';
import { maxEntries } from '@/components/data-editor';
import { PageComponent } from './component';
import { DataEntry, Resume } from './models';

export default Vue.extend({
  components: {
    BButton,
    BIcon,
    BIconChevronDown,
    BIconChevronUp
  },
  mixins: [PageComponent],
  props: {
    resume: {
      type: Resume,
      required: true
    },
    entry: {
      type: DataEntry,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  computed: {
    canUp: function (): boolean {
      return this.index !== 0;
    },
    canDown: function (): boolean {
      const nextIndex = this.resume.data.indexOf(this.entry) + 1;

      if (this.resume.data.length <= nextIndex) {
        return false;
      }

      const nextEntry = this.resume.data[nextIndex];

      if (nextEntry.type !== this.entry.type || nextEntry.state === null) {
        return false;
      }

      return this.index < (maxEntries(this.entry.type) - 1);
    },
    swapable: function (): boolean {
      return this.entry.state !== null && maxEntries(this.entry.type) > 1;
    }
  }
});
</script>
