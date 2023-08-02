<template>
  <modal
    :title="$t('template-editor.label.applicable-data-title')"
    :context="visible ? true : null"
    body-class="position-static"
    v2
    @change="$emit('change', false)"
    @show="populate"
    @hide="hiding"
    @hidden="reset">
    <!-- data list -->
    <template v-slot="{}">
      <b-list-group>
        <type-item v-for="(t, i) of types" :key="t.id" :type="t.id" :value="t.enabled" @input="enable(i, $event)" @up="up(i)" @down="down(i)"></type-item>
      </b-list-group>
    </template>
    <!-- loading -->
    <template #post-body="{}">
      <b-overlay :show="busy" no-wrap rounded no-fade></b-overlay>
    </template>
    <!-- footer -->
    <template #modal-footer="{ cancel }">
      <b-button :disabled="busy" @click="cancel">{{ $t('template-editor.label.applicable-data-cancel') }}</b-button>
      <b-button :disabled="busy || !dirty" variant="primary" @click="save">{{ $t('template-editor.label.applicable-data-save') }}</b-button>
    </template>
  </modal>
</template>

<script lang="ts">
import { BButton, BListGroup, BOverlay, BvModalEvent } from 'bootstrap-vue';
import Vue from 'vue';
import { TemplateRegistrationService } from '@/clients/template-registration';
import { AvailableTypes } from '@/components/data-editor';
import Modal from '@/components/modal';
import { Uuid } from '@/util/uuid';
import { PageContext } from './models';
import TypeItem from './type-item.vue';

export default Vue.extend({
  components: { BButton, BListGroup, BOverlay, Modal, TypeItem },
  model: {
    prop: 'visible',
    event: 'change'
  },
  props: {
    regId: {
      type: Uuid,
      required: true
    },
    context: {
      type: PageContext,
      required: true
    },
    visible: Boolean
  },
  data: function () {
    return {
      types: new Array<Item>(),
      dirty: false,
      busy: false
    };
  },
  methods: {
    populate: function (): void {
      const available = new Set(AvailableTypes);

      for (const t of this.context.applicableData) {
        this.types.push({ id: t, enabled: true });
        available.delete(t);
      }

      for (const t of available) {
        this.types.push({ id: t, enabled: false });
      }
    },
    enable: function (index: number, enabled: boolean): void {
      this.types[index].enabled = enabled;
      this.dirty = true;

      if (enabled) {
        if (index > 0 && !this.types[index - 1].enabled) {
          const item = this.types.splice(index, 1)[0];

          for (index -= 2; index >= 0; index--) {
            if (this.types[index].enabled) {
              break;
            }
          }

          if (index < 0) {
            this.types.splice(0, 0, item);
          } else {
            this.types.splice(index + 1, 0, item);
          }
        }
      } else if (index !== this.types.length - 1 && this.types[index + 1].enabled) {
        const item = this.types.splice(index, 1)[0];

        for (index += 1; index < this.types.length; index++) {
          if (!this.types[index].enabled) {
            break;
          }
        }

        if (index === this.types.length) {
          this.types.push(item);
        } else {
          this.types.splice(index, 0, item);
        }
      }
    },
    up: function (index: number): void {
      if (index > 0) {
        const item = this.types[index];
        const upper = this.types[index - 1];

        this.$set(this.types, index - 1, item);
        this.$set(this.types, index, upper);
        this.dirty = true;
      }
    },
    down: function (index: number): void {
      if (index !== this.types.length - 1 && this.types[index + 1].enabled) {
        const item = this.types[index];
        const lower = this.types[index + 1];

        this.$set(this.types, index + 1, item);
        this.$set(this.types, index, lower);
        this.dirty = true;
      }
    },
    save: async function (): Promise<void> {
      const service = new TemplateRegistrationService(this.$rest);

      // create update
      const update = new Array<string>();

      for (const i of this.types) {
        if (!i.enabled) {
          break;
        }

        update.push(i.id);
      }

      // execute update
      this.busy = true;

      try {
        await service.writeWorkspaceApplicableData(this.regId, update);
      } catch (e) {
        // TODO: display alert
        this.busy = false;
        return;
      }

      this.dirty = false;
      this.$emit('input', update);
      this.$emit('change', false);
    },
    hiding: function (e: BvModalEvent): void {
      if (this.busy && this.dirty) {
        e.preventDefault();
      }
    },
    reset: function (): void {
      this.types = [];
      this.dirty = false;
      this.busy = false;
    }
  }
});

interface Item {
  id: string;
  enabled: boolean;
}
</script>
