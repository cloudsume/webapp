<template>
  <BCollapse :id="props.collapseId" is-nav>
    <!-- left pane -->
    <NavbarResume v-if="mode === 'resume'"></NavbarResume>
    <NavbarTemplate v-else-if="mode === 'template'"></NavbarTemplate>
    <!-- right pane -->
    <BNavbarNav class="ml-auto flex-column-reverse flex-lg-row">
      <!-- mode -->
      <BNavForm form-class="flex-grow-1">
        <BFormSelect class="mode-selection" :value="mode" @change="mode = $event">
          <BFormSelectOption value="resume">{{ t('page-header.label.mode-resume-builder') }}</BFormSelectOption>
          <BFormSelectOption value="template">{{ t('page-header.label.mode-template-authoring') }}</BFormSelectOption>
        </BFormSelect>
      </BNavForm>
      <!-- drop down -->
      <BNavItemDropdown :text="name" menu-class="mb-2 mb-lg-0" right>
        <!-- verify email -->
        <template v-if="!isGuest && !emailVerified">
          <BDropdownItem :href="resendEmailConfirmationURL" target="_blank" variant="danger">
            {{ t('header.label.resend-email')}}
          </BDropdownItem>
          <BDropdownDivider></BDropdownDivider>
        </template>
        <!-- guest specific actions -->
        <template v-if="isGuest">
          <BDropdownHeader>
            ID: {{ userID }}
          </BDropdownHeader>
          <BDropdownItemButton @click="signIn">
            {{ t('page-header.label.to-permanent-account') }}
          </BDropdownItemButton>
          <BDropdownDivider></BDropdownDivider>
        </template>
        <!-- sign out -->
        <BDropdownItemButton @click="signOut">
          {{ t('user-navbar.label.sign-out') }}
        </BDropdownItemButton>
      </BNavItemDropdown>
    </BNavbarNav>
  </BCollapse>
</template>

<style lang="scss" scoped>
@import '~@/styles/bootstrap';

.mode-selection {
  width: 100%;
}

@include media-breakpoint-up(lg) {
  .mode-selection {
    width: auto;
  }
}
</style>

<script setup lang="ts">
import {
  BCollapse,
  BDropdownDivider,
  BDropdownHeader,
  BDropdownItem,
  BDropdownItemButton,
  BFormSelect,
  BFormSelectOption,
  BNavbarNav,
  BNavForm,
  BNavItemDropdown
} from 'bootstrap-vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { StorageKey } from '@/config';
import { Alert, IDP } from '@/services';
import { Locale, NavbarMode } from '@/state';
import { Session } from '@/state/session';
import { Source } from '@/store';
import { inject } from '@/util/injector';
import NavbarResume from './navbar-resume.vue';
import NavbarTemplate from './navbar-template.vue';

const { t } = useI18n();

// props & emit
const props = defineProps({
  collapseId: String,
  session: {
    type: Session,
    required: true
  }
});

// app services
const alert = inject(Alert);
const idp = inject(IDP);

// global states
const locale = inject(Locale);
const mode = inject(NavbarMode);

// computed
const name = computed(function () {
  const a = props.session.account;

  if (a) {
    return a.profile.name ?? '';
  } else {
    return t('page-header.label.guest-account') as string;
  }
});

const isGuest = computed(function () {
  return props.session.isGuest;
});

const emailVerified = computed(function () {
  return props.session.account?.profile.email_verified === true;
});

const userID = computed(function () {
  return props.session.userId.toString();
});

const resendEmailConfirmationURL = computed(function () {
  return `${process.env.OIDC_PROVIDER}/resend-confirmation`;
});

// functions
const signIn = async function () {
  try {
    await idp.signinRedirect({ ui_locales: locale.value });
  } catch (e) {
    alert.error(Source.App, () => t('sign-in.message.error'), e as Error);
  }
}

const signOut = async function () {
  if (isGuest.value) {
    if (window.confirm(t('page-header.message.guest-signout-warning') as string)) {
      localStorage.removeItem(StorageKey.GuestToken);
      localStorage.removeItem(StorageKey.WelcomeDisplayed); // sign out from a guest account should happen only on a shared computer
      window.location.replace('/');
    }
  } else {
    try {
      await idp.signoutRedirect();
    } catch (e) {
      alert.error(Source.App, () => t('sign-out.message.error'), e as Error);
    }
  }
}
</script>
