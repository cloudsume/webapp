<template>
  <BNavbarNav>
    <BNavItem :to="{ name: 'account-templates' }">
      {{ t('header.label.account-templates') }}
    </BNavItem>
    <BNavItem :to="{ name: 'sample-data' }">
      {{ t('page-header.label.sample-data') }}
    </BNavItem>
    <BNavItem :to="{ name: 'payment-receiving-methods' }">
      {{ t('header.label.payment-receiving-methods') }}
    </BNavItem>
  </BNavbarNav>
</template>

<script setup lang="ts">
import { BNavbarNav, BNavItem } from 'bootstrap-vue';
import { useI18n } from 'vue-i18n-composable';

const { t } = useI18n();
</script>
