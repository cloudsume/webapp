<template>
  <b-overlay :show="context.busy" rounded="sm" no-fade spinner-small>
    <b-input-group>
      <b-form-input :value="context.value" :state="context.state" disabled></b-form-input>
      <b-input-group-append>
        <!--
          the overlay is just obscured the content but the click event still able to raise if user clicked on a form label so we need to prevent
          that while the overlay is activated
        -->
        <b-button :id="buttonId" :disabled="context.disabled || context.busy" variant="info" @click="$emit('browse')">
          <b-icon :icon="icon"></b-icon>
        </b-button>
      </b-input-group-append>
    </b-input-group>
  </b-overlay>
</template>

<script lang="ts">
import { BButton, BFormInput, BIcon, BIconSearch, BInputGroup, BInputGroupAppend, BOverlay } from 'bootstrap-vue';
import Vue from 'vue';
import { Component } from './component';

export default Vue.extend({
  components: { BButton, BFormInput, BIcon, BIconSearch, BInputGroup, BInputGroupAppend, BOverlay },
  mixins: [Component],
  props: {
    buttonId: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: 'search'
    }
  }
});
</script>
