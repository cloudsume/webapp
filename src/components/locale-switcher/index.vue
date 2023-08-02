<template>
  <modal :title="$t('change-language.label.header')" hide-footer v3 @ok="ok" @hidden="$emit('hidden')" v-slot="{ ok }">
    <!-- north america -->
    <h5>{{ $t('north-america.label.header') }}</h5>
    <b-button variant="link" class="locale-button" @click="ok('en-US')">
      <flag-icon country="US"></flag-icon> {{ name('en-US') }}
    </b-button>
    <!-- southeast asia -->
    <h5 class="mt-3">{{ $t('southeast-asia.label.header') }}</h5>
    <b-button variant="link" class="locale-button" @click="ok('th-TH')">
      <flag-icon country="TH"></flag-icon> {{ name('th-TH') }}
    </b-button>
  </modal>
</template>

<style lang="scss" scoped>
.locale-button {
  padding: 0;
}

.locale-button:hover {
  text-decoration: none;
}
</style>

<script lang="ts">
import { BButton } from 'bootstrap-vue';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import FlagIcon from '@/components/flag-icon';
import Modal, { Proceed, ToggleBusy } from '@/components/modal';
import { getLanguageName, loadTranslation } from '@/i18n';
import { SetLocale, Source } from '@/store';

export default Vue.extend({
  components: { BButton, FlagIcon, Modal },
  methods: {
    name: function (tag: string): TranslateResult {
      return getLanguageName(tag, tag);
    },
    ok: async function (proceed: Proceed, busy: ToggleBusy, language: string): Promise<void> {
      // do nothing if the selected language is the current language
      if (language === this.$store.state.locale) {
        proceed();
        return;
      }

      // load translation
      busy(true);

      try {
        let translation = this.$i18n.getLocaleMessage(language);

        if (Object.keys(translation).length === 0) {
          translation = await loadTranslation(language);
        } else {
          // force loading idicator to show before we trigger reactivity
          await this.$nextTick();
        }

        this.$i18n.setLocaleMessage(language, translation);
      } catch (e) {
        busy(false);
        this.$error(Source.App, () => this.$t('change-language.message.error'), e as Error);
        return;
      }

      // switch locale
      this.$store.commit(new SetLocale(Source.User, language));
      this.$i18n.locale = language;

      proceed();
    }
  }
});
</script>
