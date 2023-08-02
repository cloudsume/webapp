<template>
  <b-card-footer class="d-flex">
    <!-- parent selector -->
    <parent-selector :type="type" :lang="lang" :state="state" class="flex-grow-1 mr-2" @busy="busy = $event" @change="$emit('change', $event)">
    </parent-selector>
    <!-- import global -->
    <b-button :disabled="context.saving || busy || disableImport" @click="$emit('import')">
      <b-icon icon="pencil-square"></b-icon>
    </b-button>
  </b-card-footer>
</template>

<script lang="ts">
import { BButton, BCardFooter, BFormSelect, BFormSelectOption, BIcon, BIconPencilSquare } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { DataState, maxEntries } from '@/components/data-editor';
import ParentSelector from '@/components/parent-selector';
import { PageComponent } from './component';

export default (Vue as VueConstructor<PageComponent>).extend({
  components: { BButton, BCardFooter, BFormSelect, BFormSelectOption, BIcon, BIconPencilSquare, ParentSelector },
  mixins: [PageComponent],
  props: {
    type: {
      type: String,
      required: true
    },
    lang: {
      type: String,
      required: true
    },
    state: {
      type: DataState,
      required: true
    }
  },
  data: function () {
    return {
      busy: false
    };
  },
  computed: {
    disableImport: function (): boolean {
      if (maxEntries(this.type) === 1) {
        const globals = this.context.globals[this.type];

        if (globals === undefined) {
          return false;
        } else {
          return globals[this.lang] !== undefined;
        }
      } else {
        return false;
      }
    }
  }
});
</script>
