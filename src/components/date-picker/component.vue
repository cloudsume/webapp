<template>
  <b-form-datepicker
    v-bind="$attrs"
    v-bind:locale="locale"
    v-bind:date-format-options="format"
    v-bind:label-no-date-selected="$t('select-date.label.placeholder')"
    v-bind:label-prev-year="$t('previous-year.label.button')"
    v-bind:label-prev-month="$t('previous-month.label.button')"
    v-bind:label-current-month="$t('current-month.label.button')"
    v-bind:label-next-month="$t('next-month.label.button')"
    v-bind:label-next-year="$t('next-year.label.button')"
    v-bind:label-help="$t('select-date.message.navigation')"
    v-bind:label-reset-button="$t('clear-selected-date.label.button')"
    v-bind:label-close-button="$t('cancel-select-date.label.button')"
    v-on="$listeners"
    no-flip
    value-as-date
    reset-button
    close-button>
  </b-form-datepicker>
</template>

<script src="./component.ts"></script>
