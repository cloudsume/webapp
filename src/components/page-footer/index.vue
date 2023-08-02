<template>
  <footer>
    <!-- reCAPTCHA -->
    <hr class="mt-0">
    <BContainer>
      <BRow>
        <BCol>
          <p class="text-md-center mb-0">
            <small class="text-muted">
              This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank">Privacy Policy</a> and
              <a href="https://policies.google.com/terms" target="_blank">Terms of Service</a> apply.
            </small>
          </p>
        </BCol>
      </BRow>
    </BContainer>
    <!-- our footer -->
    <hr>
    <BContainer>
      <BRow>
        <!-- links -->
        <BCol md="8" class="mb-3">
          <small class="text-muted">
            © {{ new Date().getFullYear() }} Ultima Microsystems Inc.
            <div>
              <BLink href="https://ultima-legal-us.s3.us-west-2.amazonaws.com/privacy.pdf" target="_blank">Privacy</BLink>
              |
              <BLink href="https://ultima-legal-us.s3.us-west-2.amazonaws.com/terms.pdf" target="_blank">Terms</BLink>
              |
              <BLink href="https://www.reddit.com/r/cloudsume" target="_blank">
                <BIconReddit></BIconReddit>
              </BLink>
              <BLink href="https://www.facebook.com/cloudsume" target="_blank">
                <BIconFacebook></BIconFacebook>
              </BLink>
              <BLink href="https://twitter.com/cloudsume" target="_blank">
                <BIconTwitter></BIconTwitter>
              </BLink>
              <BLink href="https://github.com/cloudsume" target="_blank">
                <BIconGithub></BIconGithub>
              </BLink>
              <BLink href="mailto:support@cloudsume.com">
                <BIconEnvelopeFill></BIconEnvelopeFill>
              </BLink>
            </div>
          </small>
        </BCol>
        <!-- locale switcher -->
        <BCol md="4" class="d-flex justify-content-md-end align-items-end mb-3">
          <div class="d-flex align-items-center">
            <BIconGlobe></BIconGlobe>&nbsp;
            <BButton variant="link" class="p-0" @click="changingLocale = true">{{ localeName }}</BButton>
          </div>
          <LocaleSwitcher v-if="changingLocale" @hidden="changingLocale = false"></LocaleSwitcher>
        </BCol>
      </BRow>
    </BContainer>
  </footer>
</template>

<script setup lang="ts">
import { BButton, BCol, BContainer, BIconEnvelopeFill, BIconFacebook, BIconGithub, BIconGlobe, BIconReddit, BIconTwitter, BLink, BRow } from 'bootstrap-vue';
import { computed, ref } from 'vue';
import LocaleSwitcher from '@/components/locale-switcher';
import { getLanguageName } from '@/i18n';
import { Locale } from '@/state';
import { inject } from '@/util/injector';

// global states
const locale = inject(Locale);

// local states
const changingLocale = ref(false);

// computed
const localeName = computed(function () {
  return getLanguageName(locale.value, locale.value);
});
</script>
