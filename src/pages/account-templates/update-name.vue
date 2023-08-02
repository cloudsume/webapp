<template>
  <Modal :title="name" :ok-disabled="!valid" body-class="pb-0" v3 @ok="ok" @hidden="hidden" v-slot="{ ok }">
    <BForm novalidate @submit.prevent="ok()">
      <BFormGroup
        :label="$t('account-templates.label.rename-name')"
        :description="$t('account-templates.message.rename-name')"
        :state="state"
        :invalid-feedback="$t('account-templates.message.rename-name-invalid')"
        label-for="rename-template-name">
        <BFormInput id="rename-template-name" :state="state" v-model="value"></BFormInput>
      </BFormGroup>
    </BForm>
  </Modal>
</template>

<script lang="ts">
import { BForm, BFormGroup, BFormInput } from 'bootstrap-vue';
import Vue from 'vue';
import { TemplateRegistrationService } from '@/clients/template-registration';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { Source } from '@/store';
import { Template } from './models';

export default Vue.extend({
  components: { BForm, BFormGroup, BFormInput, Modal },
  props: {
    template: {
      type: Template,
      required: true
    }
  },
  data: function () {
    return {
      value: ''
    };
  },
  computed: {
    name: function (): string {
      return this.template.name;
    },
    trimmedValue: function (): string {
      return this.value.trim();
    },
    state: function (): boolean | null {
      const v = this.trimmedValue;

      return v && v.length <= 100 ? null : false;
    },
    valid: function (): boolean {
      return this.state === null;
    }
  },
  methods: {
    ok: async function (proceed: Proceed, busy: ToggleBusy): Promise<void> {
      if (!this.valid) {
        return;
      }

      const value = this.trimmedValue;
      const service = new TemplateRegistrationService(this.$rest);

      busy(true);

      try {
        await service.setName(this.template.id, value);
      } catch (e) {
        const error = e as Error;

        busy(false);
        this.$error(Source.Server, () => this.$t('account-templates.message.rename-error', { error }), error);
        return;
      }

      proceed(value);
    },
    hidden: function (result: unknown): void {
      if (typeof result === 'string') {
        this.$emit('input', result);
      }

      this.$emit('hidden');
    }
  }
});
</script>
