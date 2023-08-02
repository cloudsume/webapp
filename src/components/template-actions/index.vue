<template>
  <div>
    <!-- actions -->
    <BDropdown :block="props.block" :variant="props.cancelActionVariant ? props.cancelActionVariant : 'primary'" split dropup right @click="primaryAction">
      <!-- button -->
      <template #button-content="{}">
        <div class="text-nowrap">
          {{ props.cancelAction ? props.cancelAction : t('template-browser.label.create-resume') }}
        </div>
      </template>
      <!-- items -->
      <template #default="{}">
        <BDropdownItemButton @click="copyLink">
          {{ t('template-actions.label.copy-link') }}
        </BDropdownItemButton>
      </template>
    </BDropdown>
    <!-- modals -->
    <CreateResume v-if="creating" :template-id="templateId" :is-guest="creating === 'guest'" @hidden="creating = null"></CreateResume>
  </div>
</template>

<script setup lang="ts">
import { BDropdown, BDropdownItemButton } from 'bootstrap-vue';
import { computed, ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n-composable';
import { Template } from '@/components/template-viewer';
import { Alert, Router } from '@/services';
import { Source } from '@/store';
import { inject } from '@/util/injector';
import CreateResume from './create-resume.vue';

const { t } = useI18n();

// props & emits
const props = defineProps({
  template: {
    type: Template,
    required: true
  },
  resumeCount: Number,
  cancelAction: String,
  cancelActionVariant: String,
  block: Boolean
});

const emit = defineEmits<{
  (e: 'cancel'): void;
}>();

// app services
const alert = inject(Alert);
const router = inject(Router);

// local states
const creating: Ref<'account' | 'guest' | null> = ref(null);

// computed
const templateId = computed(function () {
  return props.template.template;
});

// functions
const primaryAction = function () {
  if (props.cancelAction) {
    emit('cancel');
  } else if (typeof props.resumeCount === 'number') {
    if (props.resumeCount >= 5) {
      window.alert(t('template-actions.message.maximum-resume-reached'));
    } else {
      creating.value = 'account';
    }
  } else {
    creating.value = 'guest';
  }
};

const copyLink = async function () {
  // get link
  const { href } = router.resolve({
    name: 'template-details',
    params: {
      id: props.template.id.toString()
    }
  });

  // write to clipboard
  try {
    await navigator.clipboard.writeText(process.env.BASE_URI + href);
  } catch (e) {
    const error = e as Error;
    alert.error(Source.App, () => t('template-actions.message.copy-link-error', { error }), error);
    return;
  }

  // notify
  alert.success(Source.App, () => t('template-actions.message.link-copied'));
};
</script>
