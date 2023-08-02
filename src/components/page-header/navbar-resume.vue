<template>
  <b-navbar-nav>
    <b-nav-item :to="{ name: 'resume-list' }">{{ $t('user-navbar.label.resumes') }}</b-nav-item>
    <b-nav-item :to="{ name: 'edit-global' }">{{ $t('user-navbar.label.global-data') }}</b-nav-item>
    <b-nav-item :to="{ name: 'template-list' }">{{ $t('header.label.templates') }}</b-nav-item>
  </b-navbar-nav>
</template>

<script lang="ts">
import { BNavbarNav, BNavItem } from 'bootstrap-vue';
import Vue from 'vue';

export default Vue.extend({
  components: { BNavbarNav, BNavItem }
});
</script>
