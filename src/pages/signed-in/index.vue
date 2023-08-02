<template>
  <Page>
    <BRow>
      <BCol>
        <p class="text-center">{{ status }}</p>
      </BCol>
    </BRow>
  </Page>
</template>

<script setup lang="ts">
import { BCol, BRow } from 'bootstrap-vue';
import { computed, onMounted, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import Page from '@/components/page';
import { NavbarMode } from '@/components/page-header';
import { StorageKey } from '@/config';
import { IDP } from '@/services';
import { Session } from '@/state';
import { inject } from '@/util/injector';

const { t } = useI18n();

// app services
const idp = inject(IDP);

// global states
const session = inject(Session);

// local states
const error: Ref<Error | null> = ref(null);

// computed
const status = computed(function () {
  if (error.value) {
    return t('sign-in.message.error');
  } else {
    return t('sign-in.message.loading');
  }
});

// lifecycle hooks
onMounted(async function () {
  try {
    await idp.signinRedirectCallback();
  } catch (e) {
    error.value = e as Error;

    if (error.value.message !== 'login_required') {
      // user already signed out from provider
      // TODO: investigate if we really need this check
      console.error(e);
    }

    return;
  }

  // force user to landing on resume list if this sign in caused by account conversion
  if (session.value?.isGuest) {
    try {
      localStorage.setItem(StorageKey.NavbarMode, NavbarMode.ResumeBuilder);
    } catch (e) {
      window.alert(t('signed-in.message.navbar-switch-error'));
    }
  }

  window.location.replace('/');
});
</script>
