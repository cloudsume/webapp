<template>
  <b-card-body>
    <data-field
      :input-id="`${id}-photo`"
      :label="label()"
      :description="desc()"
      :selector="selectValue"
      :converter="convertURL"
      :validator="validateDomain"
      :comparer="compareDomain"
      :model="value"
      v-on="value.handlers"
      v-slot="p"
      class="mb-0">
      <!-- preview -->
      <div class="text-center mb-2">
        <svg v-if="p.value === null || isLoading(p.value)"
          xmlns="http://www.w3.org/2000/svg"
          class="img-thumbnail img-fluid w-100 photo-placeholder"
          width="1"
          height="1">
          <rect width="100%" height="100%" fill="#6c757d"></rect>
          <text x="50%" y="50%" fill="#dee2e6" dy=".3em">
            {{ isLoading(p.value) ? $t('photo-editor.label.loading') : $t('resume-photo-data.label.placeholder') }}
          </text>
        </svg>
        <preview v-else :data="getData(p.value)"></preview>
      </div>
      <!-- input -->
      <file-picker
        :id="`${id}-photo`"
        :disabled="p.disabled || isLoading(p.value)"
        :state="p.state"
        :value="isRemote(p.value) ? null : p.value"
        accept="image/jpeg"
        @change="fileSelected($event, p.update)">
      </file-picker>
    </data-field>
  </b-card-body>
</template>

<style lang="scss" scoped>
.photo-placeholder {
  text-anchor: middle;
}
</style>

<script lang="ts">
import { BCardBody } from 'bootstrap-vue';
import Vue, { VueConstructor } from 'vue';
import { TranslateResult } from 'vue-i18n';
import { DataProperty } from '@/clients/resume-data';
import { DataEditor, FieldValue, UpdateWriter } from '@/components/data-editor';
import DataField from '@/components/data-field';
import FilePicker from '@/components/file-picker';
import { Uuid } from '@/util/uuid';
import { future, FutureData } from '@/util/vue-future';
import Preview from './preview.vue';

export default (Vue as VueConstructor<DataEditor>).extend({
  components: { BCardBody, DataField, FilePicker, Preview },
  mixins: [DataEditor],
  data: function () {
    return {
      value: new FieldValue<FutureData<Blob | null> | File | null>()
    };
  },
  methods: {
    isLoading: function (v: unknown): boolean {
      return v instanceof FutureData && v.pending;
    },
    isRemote: function (v: unknown): boolean {
      return v instanceof FutureData;
    },
    getData: function (v: FutureData<Blob | null> | File): Blob {
      if (v instanceof FutureData) {
        if (!v.value) {
          throw new Error('The data is still loading.');
        }
        return v.value;
      } else {
        return v;
      }
    },
    fileSelected: function (event: Event, update: (v: unknown) => void): void {
      const files = (event.target as HTMLInputElement).files;

      if (!files) {
        throw new Error('No files properties.');
      }

      update(files.length ? files[0] : null);
    },
    selectValue: function (d: DataProperty<string>): DataProperty<string> {
      return d;
    },
    convertURL: function (v: string | null): FutureData<Blob | null> | null {
      if (v === null) {
        return null;
      } else {
        return future(null, () => this.$rest.downloadFile(v));
      }
    },
    validateDomain: function (v: FutureData<Blob | null> | File | null): TranslateResult | null {
      if (v === null) {
        return this.noInputError;
      } else if (v instanceof File) {
        if (v.size > 1024 * 512) {
          return this.$t('photo-editor.message.file-too-large');
        }
      }

      return null;
    },
    compareDomain: function (local: File | null, remote: FutureData<Blob | null> | null): boolean {
      if (local || remote) {
        return false;
      } else {
        return true;
      }
    },
    createUpdate: function (w: UpdateWriter): void {
      const src = this.state.remote as DataProperty<string> | null;
      const update = this.value.toDto(src, v => {
        if (!(v instanceof File)) {
          throw new Error('Unexpected value.');
        }

        const id = new Uuid().toString();
        w.writeContent(id, v);
        return id;
      });

      w.writeUpdate(update);
    }
  }
});
</script>
