<template>
  <modal
    :title="$t('resume-link-accesses.label.header', { name: linkName })"
    :ok-title="$t('close-resume-link-accesses.label.button')"
    :ok-disabled="fetching"
    :value="link"
    @input="$emit('change', $event)"
    @show="populate"
    @hide="hiding"
    @hidden="clear"
    ok-only
    scrollable>
    <b-table
      :fields="fields"
      :items="accesses"
      :empty-text="$t('resume-link-accesses.message.no-accesses')"
      primary-key="id"
      class="mb-0"
      show-empty
      sticky-header
      striped
      small
      outlined>
      <template #cell(index)="{ index }">
        {{ index + 1 }}
      </template>
      <template #cell(time)="{ item }">
        {{ formatTime(item) }}
      </template>
      <template #custom-foot v-if="accesses.length > 0">
        <b-tr>
          <b-td colspan="2" class="text-center">
            <template v-if="fetching">
              <b-spinner small></b-spinner> {{ $t('resume-link-accesses.message.fetching') }}
            </template>
            <template v-else-if="all">
              <p class="text-muted mb-0">{{ $t('resume-link-accesses.message.no-more') }}</p>
            </template>
            <template v-else>
              <b-link @click="fetch">{{ $t('fetch-next-resume-link-accesses.label.link') }}</b-link>
            </template>
          </b-td>
        </b-tr>
      </template>
    </b-table>
  </modal>
</template>

<script lang="ts">
import { BvModalEvent } from 'bootstrap-vue';
import Vue from 'vue';
import { LinkAccess, ResumeService } from '@/clients/resume';
import Modal from '@/components/modal';
import { ULID } from '@/util/ulid';
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
      linkName: '',
      accesses: new Array<LinkAccess>(),
      fetching: false,
      all: false
    };
  },
  computed: {
    fields(): any[] {
      return [
        {
          key: 'index',
          label: this.$t('resume-link-access-index.label.header')
        },
        {
          key: 'time',
          label: this.$t('resume-link-access-time.label.header')
        }
      ];
    }
  },
  methods: {
    populate(): void {
      this.linkName = this.link.name;
      this.accesses = [...this.link.accesses];
    },
    async fetch(): Promise<void> {
      const service = new ResumeService(this.$rest);
      let accesses;

      this.fetching = true;

      try {
        accesses = await service.listLinkAccesses(new Uuid(this.resumeId), this.link.id, this.accesses[this.accesses.length - 1].id);
      } finally {
        this.fetching = false;
      }

      if (accesses.length === 0) {
        this.all = true;
      } else {
        this.accesses.push(...accesses);
      }
    },
    formatTime: function (a: LinkAccess): string {
      return this.$d(a.id.time, 'short');
    },
    hiding(e: BvModalEvent): void {
      if (this.fetching) {
        e.preventDefault();
      }
    },
    clear(): void {
      this.accesses = [];
      this.all = false;
    }
  }
});
</script>
