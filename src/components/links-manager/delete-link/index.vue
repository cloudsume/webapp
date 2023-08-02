<template>
  <modal
    :title="$t('delete-resume-link.label.header')"
    :cancel-title="$t('cancel-delete-resume-link.label.button')"
    :ok-title="$t('delete-resume-link.label.button')"
    :value="link"
    @input="$emit('change', $event)"
    @ok="submit"
    @hide="hiding"
    ok-variant="danger"
    body-class="position-static">
    <template v-slot="{ data }">
      {{ $t('delete-resume-link.message.confirmation', { name: data.name }) }}
    </template>
    <template #post-body>
      <b-overlay :show="busy" no-wrap rounded></b-overlay>
    </template>
  </modal>
</template>

<script lang="ts">
import { BvModalEvent } from 'bootstrap-vue';
import Vue from 'vue';
import { ResumeService } from '@/clients/resume';
import Modal from '@/components/modal';
import { Uuid } from '@/util/uuid';

export default Vue.extend({
  components: { Modal },
  model: {
    prop: 'link',
    event: 'change'
  },
  props: {
    resumeId: {
      type: String,
      required: true
    },
    link: {
      type: Object
    }
  },
  data: function () {
    return {
      busy: false
    };
  },
  methods: {
    async submit(): Promise<void> {
      const service = new ResumeService(this.$rest);
      const link = this.link.id;

      this.busy = true;

      try {
        await service.deleteLink(new Uuid(this.resumeId), link);
      } finally {
        this.busy = false;
      }

      this.$emit('change', undefined);
      this.$emit('input', link);
    },
    hiding(e: BvModalEvent): void {
      if (this.busy) {
        e.preventDefault();
      }
    }
  }
});
</script>
