<template>
  <b-list-group-item>
    <!-- header -->
    <div class="d-flex justify-content-between align-items-center mb-1">
      <h5 class="mb-0">{{ name }}</h5>
      <b-form-checkbox :disabled="unselectable" :value="true" :unchecked-value="false" :checked="value.selected" @change="$emit('change', $event)">
      </b-form-checkbox>
    </div>
    <!-- content -->
    <property-viewer :type="type" :field="value.name ? value.name : null" :value="value.value">
      <template #single-line="{ value }">{{ value }}</template>
    </property-viewer>
  </b-list-group-item>
</template>

<script lang="ts">
import { BFormCheckbox, BListGroupItem } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { TranslateResult } from 'vue-i18n';
import { getDataMetadata, getPropertyLabel, isAllowedAlphabets, PropertyType } from '@/components/data-editor';
import PropertyViewer from '@/components/property-viewer';
import { PageComponent } from './component';
import { ImportField } from './models';

export default (Vue as VueConstructor<PageComponent>).extend({
  components: { BFormCheckbox, BListGroupItem, PropertyViewer },
  mixins: [PageComponent],
  props: {
    type: {
      type: String,
      required: true
    },
    value: {
      type: ImportField,
      required: true
    },
    targetLang: {
      type: String,
      required: true
    }
  },
  computed: {
    name: function (): TranslateResult {
      if (this.value.name === null) {
        return getDataMetadata(this.type).label(this.$i18n);
      } else {
        return getPropertyLabel(this.$i18n, this.type, this.value.name);
      }
    },
    unselectable: function (): boolean {
      const v = this.value.value;

      if (typeof v === 'string') {
        return !isAllowedAlphabets(v, this.targetLang);
      } else {
        return false;
      }
    }
  }
});
</script>
