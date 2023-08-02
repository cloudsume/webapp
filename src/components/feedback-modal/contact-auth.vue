<template>
  <div>
    <!-- allow contact -->
    <BFormCheckbox class="mb-3" v-model="allow">
      {{ t('feedback-modal.label.contact') }}
    </BFormCheckbox>
    <!-- email -->
    <BFormGroup v-if="allow" :label="t('feedback-modal.label.contact-email')" label-for="contact-email">
      <BFormInput :value="value" id="contact-email" type="email" @update="emit('input', $event)"></BFormInput>
    </BFormGroup>
  </div>
</template>

<script setup lang="ts">
import { BFormCheckbox, BFormGroup, BFormInput } from 'bootstrap-vue';
import { ref, watch } from 'vue';
import { useTranslation } from '@/i18n';
import { Session } from '@/state';
import { inject } from '@/util/injector';

const { t } = useTranslation();

// props & emit
defineProps({
  value: String
});

const emit = defineEmits<{
  (e: 'input', v: string): void;
}>();

// global states
const session = inject(Session);

// local states
const allow = ref(false);

watch(allow, v => emit('input', v ? session.value?.verifiedEmail ?? '' : ''));
</script>
