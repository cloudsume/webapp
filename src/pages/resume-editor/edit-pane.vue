<template>
  <b-form novalidate @submit="$emit('submit', $event)">
    <!-- entries -->
    <div v-if="resume" class="accordion mb-3">
      <data-card
        v-for="{ index, data } of entries"
        :key="data.id"
        :resume="resume"
        :template="template"
        :entry="data"
        :index="index"
        @create="$emit('create', data.id)"
        @delete="$emit('delete', data.id)"
        @change="$emit('change', data.state, $event)"
        @switch="$emit('switch', data.state, $event)"
        @up="$emit('up', data.id)"
        @down="$emit('down', data.id)"
        @result="$emit('result', data.state, $event)"
        @dirty="$emit('dirty', data.state, $event)"
        @globalimport="$emit('globalimport', data.type, data.state)">
      </data-card>
    </div>
    <!-- actions -->
    <edit-actions :resume="resume"></edit-actions>
  </b-form>
</template>

<script lang="ts">
import Vue from 'vue';
import DataCard from './data-card.vue';
import EditActions from './edit-actions.vue';
import { DataEntry, Resume, Template } from './models';

export default Vue.extend({
  components: { EditActions, DataCard },
  props: {
    resume: Resume,
    template: Template
  },
  computed: {
    entries: function (): Array<Entry> {
      const r = new Array<Entry>();
      let p, i = 0;

      for (const e of this.resume.data) {
        if (e.type !== p) {
          i = 0;
        }

        r.push({ index: i, data: e });

        i++;
        p = e.type;
      }

      return r;
    }
  }
});

interface Entry {
  index: number;
  data: DataEntry;
}
</script>
