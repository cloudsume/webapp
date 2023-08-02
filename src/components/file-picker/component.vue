<template functional>
  <b-form-file
    v-bind="data.attrs"
    v-bind:placeholder="parent.$t('select-file.label.placeholder')"
    v-bind:browse-text="parent.$t('browse-file.label.button')"
    v-on="listeners">
  </b-form-file>
</template>

<script src="./component.ts"></script>
