<template>
  <Modal :title="t('resume-list.label.welcome-title')" hide-footer v3 @hidden="emit('hidden')" v-slot="{}">
    <!-- guest warning -->
    <template v-if="isGuest">
      <p>
        <strong>{{ t('resume-list.message.welcome-guest-warning') }}</strong>
      </p>
      <p class="d-lg-none">{{ t('resume-list.message.welcome-account-conversion-mobile') }}</p>
      <p class="d-none d-lg-block">{{ t('resume-list.message.welcome-account-conversion-desktop')}} </p>
    </template>
    <!-- keep in touch -->
    <p>{{ t('resume-list.message.welcome-paragraph-1') }}</p>
    <!-- reddit -->
    <BButton href="https://www.reddit.com/r/cloudsume" target="_blank" variant="outline-primary" block>
      <BIconReddit></BIconReddit> {{ t('resume-list.label.join-reddit') }}
    </BButton>
    <!-- twitter -->
    <BButton v-if="false" href="https://twitter.com/cloudsume" target="_blank" variant="outline-primary" block>
      <BIconTwitter></BIconTwitter> {{ t('resume-list.label.follow-twitter') }}
    </BButton>
    <!-- facebook -->
    <BButton href="https://www.facebook.com/cloudsume" target="_blank" variant="outline-primary" block>
      <BIconFacebook></BIconFacebook> {{ t('resume-list.label.like-facebook') }}
    </BButton>
  </Modal>
</template>

<script setup lang="ts">
import { BButton, BIconFacebook, BIconReddit, BIconTwitter } from 'bootstrap-vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import Modal from '@/components/modal';
import { Session } from '@/state';
import { inject } from '@/util/injector';

const { t } = useI18n();

// props & emit
const emit = defineEmits<{
  (e: 'hidden'): void;
}>();

// global states
const session = inject(Session);

// computed
const isGuest = computed(function () {
  return session.value?.isGuest === true;
});
</script>
