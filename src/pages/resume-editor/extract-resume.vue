<template>
  <b-list-group class="mb-3">
    <!-- simple data -->
    <import-field v-if="isSimple && fields" :type="type" :value="fields" :target-lang="targetLang" @change="selectField(fields, $event)">
    </import-field>
    <!-- complex data -->
    <template v-else-if="fields && fields.length">
      <import-field v-for="f of fields" :key="f.name" :type="type" :value="f" :target-lang="targetLang" @change="selectField(f, $event)">
      </import-field>
    </template>
    <!-- no any importable fields -->
    <b-list-group-item v-else>
      {{ $t('extract-resume-data.message.no-fields') }}
    </b-list-group-item>
  </b-list-group>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataProperty } from '@/clients/resume-data';
import { getDataMetadata } from '@/components/data-editor';
import ImportField from './import-field.vue';
import { ImportField as Field } from './models';

export default Vue.extend({
  components: { ImportField },
  props: {
    type: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    targetLang: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      fields: getFields(this.type, this.data)
    };
  },
  computed: {
    isSimple: function (): boolean {
      return !Array.isArray(this.fields);
    },
    hasSelected: function (): boolean {
      if (this.fields === null) {
        return false;
      } else if (this.fields instanceof Field) {
        return this.fields.selected;
      } else {
        return this.fields.some(f => f.selected);
      }
    }
  },
  mounted: function () {
    this.$emit('ready');
  },
  methods: {
    selectField: function (f: Field, s: boolean): void {
      f.selected = s;
    },
    createResult: function (): Field | Field[] {
      if (this.fields === null) {
        throw new Error('No selected fields.');
      } else if (this.fields instanceof Field) {
        if (!this.fields.selected) {
          throw new Error('No selected fields.');
        }

        return this.fields;
      } else {
        const selected = this.fields.filter(f => f.selected);

        if (!selected.length) {
          throw new Error('No selected fields.');
        }

        return selected;
      }
    }
  },
  watch: {
    'hasSelected': {
      immediate: true,
      handler: function (n) {
        this.$emit('change', n ? this.createResult : null);
      }
    }
  }
});

function getFields(type: string, data: object): Field | Field[] | null {
  const m = getDataMetadata(type);

  if (m.props) {
    const fields = new Array<Field>();

    for (const p of m.props) {
      const { value } = Reflect.get(data, p.name) as DataProperty<unknown>;

      if (value === null) {
        continue;
      }

      fields.push(new Field(p.name, p.type, Object.freeze(value)));
    }

    return fields;
  } else if (m.type !== undefined) {
    const { value } = data as DataProperty<unknown>;

    if (value === null) {
      return null;
    } else {
      return new Field(null, m.type, Object.freeze(value));
    }
  } else {
    throw new Error(`Don't know available fields to import for '${type}'.`);
  }
}
</script>
