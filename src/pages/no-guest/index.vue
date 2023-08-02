<template>
  <Page class="flex-grow-1 d-flex align-items-center justify-content-center">
    <p class="lead">{{ t('no-guest.message.not-available') }}</p>
  </Page>
</template>

<script setup lang="ts">
import Page from '@/components/page';
import { useTranslation } from '@/i18n';

const { t } = useTranslation();
</script>
