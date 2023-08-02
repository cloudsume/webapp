<template>
  <div class="form-group d-flex align-items-center justify-content-between">
    <b-link :to="{ name: 'resume-list' }" :disabled="context.saving">
      {{ $t('cancel-edit-resume.label.link') }}
    </b-link>
    <b-overlay :show="context.saving" rounded spinner-small>
      <b-button type="submit" variant="primary" :disabled="!canSave">
        {{ $t('save-resume.label.button') }}
      </b-button>
    </b-overlay>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { DataFlags } from '@/components/data-editor';
import { PageComponent } from './component';
import { Resume } from './models';

export default (Vue as VueConstructor<PageComponent>).extend({
  mixins: [PageComponent],
  props: {
    resume: {
      type: Resume
    }
  },
  computed: {
    canSave: function (): boolean {
      let changes = false;

      if (!this.resume) {
        return false;
      }

      const error = this.resume.iterateData((e, i) => {
        if (!e.state) {
          return;
        }

        // short circuit if there are any errors
        if (e.state.flags & DataFlags.Error) {
          return false;
        }

        if (e.state.dirty || i !== this.context.remotePositions.get(e.state)) {
          // don't return immediately due to it is possible that some entries after this has errors
          changes = true;
        }
      });

      if (error !== undefined) {
        return false;
      }

      return changes || this.resume.deletes.length > 0;
    }
  }
});
</script>
