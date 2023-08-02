<template>
  <modal
    :title="title"
    :cancel-title="$t('cancel-confirmation.label.button')"
    :ok-title="$t('accept-confirmation.label.button')"
    :ok-variant="variant"
    :value="value"
    @input="$emit('change', $event)"
    @ok="confirm"
    @hide="hiding"
    body-class="position-static">
    <template #default="{ data }">
      <slot :data="data">
        {{ getMessage(data) }}
      </slot>
    </template>
    <template #post-body>
      <b-overlay :show="busy" no-wrap rounded></b-overlay>
    </template>
  </modal>
</template>

<script src="./component.ts"></script>
