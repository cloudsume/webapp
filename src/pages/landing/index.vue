<template>
  <main>
    <!-- banner -->
    <div class="banner">
      <BContainer class="text-center">
        <h1>{{ t('landing.message.hero-title') }}</h1>
        <h6 class="text-muted pb-3">{{ t('landing.message.hero-message') }}</h6>
        <div class="mb-3">
          <BButton variant="success" size="lg" href="/templates">{{ t('landing.label.browse-templates') }}</BButton>
        </div>
        <img class="app-img" src="./app.png">
      </BContainer>
    </div>
    <!-- content -->
    <BContainer class="py-4">
      <!-- highlight -->
      <section>
        <!-- header -->
        <div class="d-flex flex-column align-items-center pt-5 pb-5 pb-md-4">
          <div class="text-center">
            <h2>{{ t('landing.message.highlight-title') }}</h2>
          </div>
          <div class="highlight-message">
            <h6 class="text-muted">{{ t('landing.message.highlight-message') }}</h6>
          </div>
        </div>
        <!-- items -->
        <BRow>
          <!-- free -->
          <BCol md="4" class="d-flex justify-content-md-start pr-md-0">
            <div class="highlight-item">
              <BIconHeartFill variant="danger" class="highlight-icon"></BIconHeartFill>
              <h5 class="py-3">{{ t('landing.label.highlight-free') }}</h5>
              <p class="text-muted">{{ t('landing.message.highlight-free') }}</p>
            </div>
          </BCol>
          <!-- no hidden costs -->
          <BCol md="4" class="d-flex justify-content-md-center px-md-0">
            <div class="highlight-item">
              <BIconCheck2Square variant="success" class="highlight-icon"></BIconCheck2Square>
              <h5 class="py-3">{{ t('landing.label.highlight-hidden-cost') }}</h5>
              <p class="text-muted">{{ t('landing.message.highlight-hidden-cost') }}</p>
            </div>
          </BCol>
          <!-- privacy -->
          <BCol md="4" class="d-flex justify-content-md-end pl-md-0">
            <div class="highlight-item">
              <BIconShieldLockFill variant="primary" class="highlight-icon"></BIconShieldLockFill>
              <h5 class="py-3">{{ t('landing.label.highlight-privacy') }}</h5>
              <p class="text-muted">{{ t('landing.message.highlight-privacy') }}</p>
            </div>
          </BCol>
        </BRow>
      </section>
      <!-- features -->
      <section>
        <!-- cloud storage -->
        <BRow class="align-items-center">
          <BCol cols="12" lg="7" class="feature-column">
            <h3 class="mb-0">{{ t('landing.message.cloud-storage-title') }}</h3>
            <div class="col-lg-7 col-xl-6 p-0">
              <p class="py-4 m-0 text-muted">{{ t('landing.message.cloud-storage-message-1') }}</p>
              <p class="text-muted mb-0">
                <strong>{{ t('landing.message.cloud-storage-message-2') }}</strong>
              </p>
            </div>
          </BCol>
          <BCol cols="12" lg="5" class="feature-column text-center">
            <img class="cloud-storage" src="./cloud-storage.png">
          </BCol>
        </BRow>
        <!-- template switching -->
        <BRow class="align-items-center flex-lg-row-reverse">
          <BCol cols="12" lg="5" class="feature-column">
            <h3 class="mb-4">{{ t('landing.message.switch-template-title') }}</h3>
            <div class="col-lg-9 col-xl-8 p-0">
              <p class="text-muted mb-0">{{ t('landing.message.switch-template-message') }}</p>
            </div>
          </BCol>
          <BCol cols="12" lg="7" class="feature-column text-center">
            <img class="template-switching" src="./template-switching.png">
          </BCol>
        </BRow>
        <!-- much more -->
        <BRow class="align-items-center">
          <BCol cols="12" lg="7" class="feature-column">
            <h3 class="mb-4">{{ t('landing.message.much-more-title') }}</h3>
            <div class="col-lg-7 col-xl-6 p-0">
              <p class="text-muted mb-0">{{ t('landing.message.much-more-message') }}</p>
            </div>
          </BCol>
          <BCol cols="12" lg="5" class="feature-column text-center">
            <img class="img-fluid" src="./much-more.png">
          </BCol>
        </BRow>
      </section>
      <!-- authoring features -->
      <section>
        <BRow class="latex-features">
          <!-- header -->
          <BCol cols="12" class="text-center pb-5">
            <h2>{{ t('landing.message.latex-author-title') }}</h2>
            <h6 class="text-muted">{{ t('landing.message.latex-author-message') }}</h6>
          </BCol>
          <!-- built-in editor -->
          <BCol cols="12" md="6" lg="3" class="mb-3 mb-lg-0">
            <BCard body-class="text-center" :img-src="require('./builtin-editor.png')" style="border: none">
              <h6 class="mb-0">{{ t('landing.message.builtin-editor') }}</h6>
            </BCard>
          </BCol>
          <!-- full XeTeX -->
          <BCol cols="12" md="6" lg="3" class="mb-3 mb-lg-0">
            <BCard body-class="text-center" :img-src="require('./full-xetex.png')" style="border: none">
              <h6 class="mb-0">{{ t('landing.message.full-xetex') }}</h6>
            </BCard>
          </BCol>
          <!-- powerful template engine -->
          <BCol cols="12" md="6" lg="3" class="mb-3 mb-lg-0">
            <BCard body-class="text-center" :img-src="require('./powerful-template-engine.png')" style="border: none">
              <h6 class="mb-0">{{ t('landing.message.template-engine') }}</h6>
            </BCard>
          </BCol>
          <!-- the choice is yours -->
          <BCol cols="12" md="6" lg="3">
            <BCard body-class="text-center" :img-src="require('./the-choice-is-yours.png')" style="border: none">
              <h6 class="mb-0">{{ t('landing.message.choice-is-yours') }}</h6>
            </BCard>
          </BCol>
        </BRow>
      </section>
      <!-- signup reminder -->
      <section>
        <div class="signup-reminder">
          <div class="pb-3">
            <h4>{{ t('landing.message.signup-reminder') }}</h4>
          </div>
          <BButton variant="primary" size="lg" class="reminder-button" href="/templates">{{ t('landing.label.browse-templates') }}</BButton>
          <BButton size="lg" class="reminder-button" @click="signIn">{{ t('landing.label.publish-template') }}</BButton>
        </div>
      </section>
    </BContainer>
  </main>
</template>

<style lang="scss" scoped>
@import '~@/styles/bootstrap';

$banner-background: #f7f8fa;

.banner {
  background-color: $banner-background;
}

.app-img {
  width: 600px;
  max-width: 100%;
}

.highlight-message {
  text-align: center;
  max-width: map-get($container-max-widths, sm);
}

.highlight-item {
  flex-basis: 100%;
  margin-bottom: map-get($spacers, 5);
}

.highlight-icon {
  width: 62px;
  height: 62px;
}

.feature-column {
  margin-bottom: map-get($spacers, 5);
}

.cloud-storage {
  height: 450px;
}

.template-switching {
  width: 600px;
  max-width: 100%;
}

.latex-features {
  margin-bottom: map-get($spacers, 5);
}

.signup-reminder {
  background-color: $banner-background;
  text-align: center;
  padding: map-get($spacers, 5);
}

.reminder-button {
  display: block;
  width: 100%;
  padding-left: map-get($spacers, 4);
  padding-right: map-get($spacers, 4);
}

.reminder-button:not(:last-child) {
  margin-bottom: map-get($spacers, 2);
}

@include media-breakpoint-up(md) {
  .highlight-item {
    flex-basis: 61%;
  }
}

@include media-breakpoint-up(lg) {
  .reminder-button {
    display: inline-block;
    width: auto;
  }

  .reminder-button:not(:last-child) {
    margin-bottom: 0;
  }
}
</style>

<script setup lang="ts">
import { BButton, BCard, BCol, BContainer, BIconCheck2Square, BIconHeartFill, BIconShieldLockFill, BRow } from 'bootstrap-vue';
import { useI18n } from 'vue-i18n-composable';
import { IDP } from '@/services';
import { Locale } from '@/state';
import { inject } from '@/util/injector';

const { t } = useI18n();

// app services
const idp = inject(IDP);

// global states
const locale = inject(Locale);

// functions
const signIn = async function () {
  try {
    await idp.signinRedirect({ ui_locales: locale.value });
  } catch (e) {
    console.error(e);
    window.alert(t('sign-in.message.error'));
  }
}
</script>
