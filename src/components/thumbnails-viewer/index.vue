<template>
  <b-card no-body>
    <!-- header -->
    <b-nav v-if="thumbnails.length" slot="header" card-header pills v-b-scrollspy:[contentId]="10">
      <b-nav-item v-for="(u, i) of thumbnails" :key="u" :href="`#${contentId}-${i}`" @click="pageClick">
        {{ $t('thumbnails-viewer.label.page-number', { num: i + 1 }) }}
      </b-nav-item>
    </b-nav>
    <!-- content -->
    <b-card-body :id="contentId" ref="thumbnails" class="position-relative bg-secondary pb-1" style="overflow-y: scroll">
      <img v-for="(u, i) of thumbnails" :key="i" :src="u" :id="`${contentId}-${i}`" class="img-thumbnail mb-3">
    </b-card-body>
  </b-card>
</template>

<script lang="ts">
import { BCard, BCardBody, BNav, BNavItem, VBScrollspy } from 'bootstrap-vue';
import Vue from 'vue';

export default Vue.extend({
  components: { BCard, BCardBody, BNav, BNavItem },
  directives: {
    'b-scrollspy': VBScrollspy
  },
  props: {
    contentId: {
      type: String,
      required: true
    },
    thumbnails: {
      type: Array,
      default: []
    }
  },
  methods: {
    pageClick: function (e: Event): void {
      e.preventDefault();

      // get target element to scroll to
      const navigator = e.target;

      if (!(navigator instanceof HTMLAnchorElement)) {
        throw new Error(`Unexpected element ${navigator}.`);
      }

      const selector = navigator.getAttribute('href');

      if (selector == null) {
        throw new Error(`Element ${navigator} has no 'href' attribute.`);
      }

      const target = document.querySelector(selector);

      if (target == null) {
        throw new Error(`Cannot find element ${selector}.`);
      } else if (!(target instanceof HTMLImageElement)) {
        throw new Error(`Unexpected element from ${selector}.`);
      }

      // scroll
      if (!(this.$refs.thumbnails instanceof Element)) {
        throw new Error(`Unexpected reference to 'thumbnails': ${this.$refs.thumbnails}.`);
      }

      this.$refs.thumbnails.scrollTop = target.offsetTop;
    }
  }
});
</script>
