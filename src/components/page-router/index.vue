<template>
  <main class="flex-grow-1 position-relative d-flex flex-column page">
    <!-- main view -->
    <RouterView v-if="!isGuest || allowGuest" v-show="!loading" :key="route.fullPath"></RouterView>
    <NoGuest v-else v-show="!loading"></NoGuest>
    <!-- feedback -->
    <div class="feedback-strip">
      <BButton variant="success" @click="givingFeedback = true">
        <BIconEmojiFrownFill></BIconEmojiFrownFill>
      </BButton>
    </div>
    <!-- loading -->
    <BOverlay :show="loading > 0" opacity="1" no-wrap no-fade></BOverlay>
    <!-- modals -->
    <FeedbackModal v-if="givingFeedback" @hidden="givingFeedback = false"></FeedbackModal>
  </main>
</template>

<style lang="scss" scoped>
@import '~@/styles/config';

.page {
  margin-top: $navbar-height;
}

.feedback-strip {
  position: fixed;
  z-index: $zindex-fixed;
  bottom: $spacer;
  right: $spacer;
}
</style>

<script setup lang="ts">
import { BButton, BIconEmojiFrownFill, BOverlay } from 'bootstrap-vue';
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import { useRoute } from 'vue-router/composables';
import FeedbackModal from '@/components/feedback-modal';
import { useTranslation } from '@/i18n';
import NoGuest from '@/pages/no-guest';
import { RouteMeta } from '@/router';
import { Loading, Session } from '@/state';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';

const route = useRoute();
const { t } = useTranslation();

// global states
const loading = inject(Loading);
const session = inject(Session);

// local states
const givingFeedback = ref(false);

// computed
const isGuest = computed({ session }, function () {
  const session = this.session.value;

  if (!session) {
    return false;
  }

  return session.isGuest;
});

const allowGuest = computed(function () {
  const m = route.meta;

  if (!(m instanceof RouteMeta)) {
    return true;
  }

  return m.allowGuest;
});
</script>
