<template>
  <Modal :title="title" :ok-title="t('close-resume-link-url.label.button')" ok-only v3 @hidden="emit('hidden')">
    <BRow>
      <BCol>
        <BInputGroup>
          <!-- link -->
          <BFormInput :value="url" readonly></BFormInput>
          <!-- copy button -->
          <BInputGroupAppend>
            <BButton @click="copy">{{ t('links-manager.label.copy-link') }}</BButton>
          </BInputGroupAppend>
        </BInputGroup>
      </BCol>
    </BRow>
  </Modal>
</template>

<script setup lang="ts">
import { BButton, BCol, BFormInput, BInputGroup, BInputGroupAppend, BRow } from 'bootstrap-vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import Modal from '@/components/modal';
import { Alert } from '@/services';
import { Source } from '@/store';
import { inject } from '@/util/injector';
import { Link } from './models';

const { t } = useI18n();

// props & emit
const props = defineProps({
  link: {
    type: Link,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'hidden'): void;
}>();

// app services
const alert = inject(Alert);

// computed
const title = computed(function () {
  return props.link.name;
});

const url = computed(function () {
  return `${process.env.SERVER_URI}/resumes?link=${props.link.id}`;
});

// functions
const copy = async function () {
  try {
    await navigator.clipboard.writeText(url.value);
  } catch (e) {
    alert.error(Source.User, () => t('links-manager.message.copy-link-error'), e as Error);
    return;
  }

  alert.success(Source.User, () => t('links-manager.message.link-copied'));
}
</script>
