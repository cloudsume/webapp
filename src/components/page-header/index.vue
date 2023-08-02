<template>
  <header :class="isLanding ? null : ['fixed-top', 'bg-white', 'navbar-container']">
    <BNavbar toggleable="lg" :class="{ 'navbar-landing': isLanding }">
      <BContainer>
        <!-- brand -->
        <NavbarBrand :session="session"></NavbarBrand>
        <!-- session navbar -->
        <template v-if="session">
          <BNavbarToggle target="main-menu"></BNavbarToggle>
          <NavbarSession collapse-id="main-menu" :session="session"></NavbarSession>
        </template>
        <!-- public navbar -->
        <BNavbarNav v-else class="ml-auto">
          <li class="nav-item">
            <BButton variant="primary" class="px-4" @click="signIn">
              {{ t('sign-in.label.link') }}
            </BButton>
          </li>
        </BNavbarNav>
      </BContainer>
    </BNavbar>
  </header>
</template>

<style lang="scss" scoped>
.navbar-container {
  border-bottom: 1px solid #eaecef;
}

.navbar-landing {
  background-color: #f7f8fa;
  padding-top: 49px;
  padding-bottom: 63px;
}
</style>

<script setup lang="ts">
import { BButton, BContainer, BNavbar, BNavbarNav, BNavbarToggle } from 'bootstrap-vue';
import { inject as injectOptional } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { IDP, Router } from '@/services';
import { Locale, Session } from '@/state';
import { inject } from '@/util/injector';
import NavbarBrand from './navbar-brand';
import NavbarSession from './navbar-session.vue';

const { t } = useI18n();

// app services
const idp = inject(IDP);
const router = injectOptional(Router);

// global states
const locale = inject(Locale);
const session = inject(Session);

// local states
const isLanding = !router;

// functions
const signIn = async function () {
  try {
    await idp.signinRedirect({ ui_locales: locale.value });
  } catch (e) {
    console.error(e);
    window.alert(t('sign-in.message.error'));
  }
};
</script>
