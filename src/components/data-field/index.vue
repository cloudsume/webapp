<template>
  <BFormGroup
    :description="description"
    :invalid-feedback="error"
    :state="error === null ? null : false">
    <!-- label -->
    <template #label={}>
      <div class="d-flex justify-content-between align-items-center">
        <!-- label -->
        <label :for="inputId" class="mb-0">{{ label }}</label>
        <!-- link -->
        <BFormCheckbox :disabled="saving" :checked="mode === 'base'" button-variant="light" size="sm" button @change="link">
          <BIconLink></BIconLink>
        </BFormCheckbox>
      </div>
    </template>
    <!-- input -->
    <template #default="{}">
      <slot
        :disabled="saving || mode === 'base'"
        :state="invalid === null ? null : false"
        :value="mode === 'base' ? parentValue : mode === 'disabled' ? converter(null) : value"
        :update="input"
        :valid="setInputValid"
        :invalid="setInputInvalid">
      </slot>
    </template>
  </BFormGroup>
</template>

<script setup lang="ts">
import { BFormCheckbox, BFormGroup, BIconLink } from 'bootstrap-vue';
import { ref, Ref, watch } from 'vue';
import { DataProperty, PropertyFlags } from '@/clients/resume-data';
import { ContextKey, FieldValue, StateKey, ValueMode } from '@/components/data-editor';
import { useTranslation } from '@/i18n';
import { computed } from '@/util/computed';
import { inject } from '@/util/injector';

const { t } = useTranslation();

// props & emit
const props = defineProps({
  inputId: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  selector: {
    type: Function,
    required: true
  },
  converter: {
    type: Function,
    default: function (v: unknown) {
      if (v === null) {
        return '';
      } else if (typeof v === 'string') {
        return v;
      } else {
        throw new Error(`Don't know how to convert ${typeof v} to string.`);
      }
    }
  },
  validator: {
    type: Function,
    default: () => null
  },
  comparer: {
    type: Function,
    default: function (local: unknown, remote: unknown) {
      if (typeof local === 'string') {
        return local.trim() === remote;
      } else {
        return local === remote;
      }
    }
  },
  model: {
    type: FieldValue,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'change', v: ValueMode | undefined): void;
  (e: 'input', v: unknown | undefined): void;
  (e: 'valid'): void;
  (e: 'invalid'): void;
}>();

// editor states
const context = inject(ContextKey);
const state = inject(StateKey);

// local states
const mode: Ref<ValueMode> = ref('disabled');
const inputError: Ref<(() => string) | null> = ref(null);

if (state.remote === null) {
  // newly created entry
  emit('input', (props.converter as any)(null));
} else {
  // leave model.value to be undefined if we already have a remote
  const src = (props.selector as any)(state.remote) as DataProperty<unknown>;

  if (src.flags & PropertyFlags.Disabled) {
    mode.value = 'disabled';
  } else if (src.value === null) {
    mode.value = 'base';
  } else {
    mode.value = 'local';
  }
}

// computed
const remote = computed(function (): DataProperty<unknown> | null {
  return state.remote ? (props.selector as any)(state.remote) : null;
});

const remoteMode = computed(function (): ValueMode | undefined {
  const v = remote.value;

  if (v === null) {
    return undefined;
  } else if (v.flags & PropertyFlags.Disabled) {
    return 'disabled';
  } else if (v.value === null) {
    return 'base';
  } else {
    return 'local';
  }
});

const remoteValue = computed(function (): unknown {
  return remote.value === null ? undefined : (props.converter as any)(remote.value.value);
});

const value = computed(function (): unknown {
  if ((props.model as any).value === undefined) {
    // the only cases for model.value to be undefined are the input is the same as remote
    // that mean we have a remote value for sure
    return remoteValue.value;
  } else {
    return (props.model as any).value;
  }
});

const parentValue = computed(function (): unknown {
  const parent = state.parent;

  if (parent === null) {
    return (props.converter as any)(null);
  }

  const value = context.getParentValue(parent, props.selector as any);

  return (props.converter as any)(value);
});

const invalid = computed(function (): string | null {
  if (mode.value !== 'local') {
    return null;
  }

  return inputError.value ? inputError.value() : (props.validator as any)(value.value);
});

const error = computed(function (): string | null {
  if (mode.value === 'base') {
    return state.parent === null ? t('field-editor.message.no-parent') : null;
  } else {
    return invalid.value;
  }
});

const saving = computed(function () {
  return context.saving;
});

// functions
const notifyInput = function (v: unknown): void {
  // check if the local input is the same as remote, if yes raise undefined instead
  if (v !== undefined && remoteValue.value !== undefined && (props.comparer as any)(v, remoteValue.value)) {
    v = undefined;
  }

  emit('input', v);
}

const notifyModeChanges = function (): void {
  emit('change', mode.value === remoteMode.value ? undefined : mode.value);
}

const change = function (m: ValueMode): void {
  // mimic first-load behavior
  const v = remote.value === null ? (props.converter as any)(null) : undefined;

  mode.value = m;
  notifyInput(v);
  notifyModeChanges();
};

const link = function (v: boolean) {
  if (v) {
    change('base');
  } else if (remoteMode.value === 'base') {
    change('disabled');
  } else {
    change(remoteMode.value || 'disabled');
  }
};

const input = function (v: unknown): void {
  switch (mode.value) {
    case 'disabled':
      if ((props.comparer as any)(v, (props.converter as any)(null))) {
        return;
      }

      change('local');
      notifyInput(v);
      break;
    case 'local':
      notifyInput(v);

      if ((props.comparer as any)(v, (props.converter as any)(null))) {
        change('disabled');
      }
      break;
  }
};

const setInputValid = function (): void {
  inputError.value = null;
};

const setInputInvalid = function (e: () => string): void {
  inputError.value = e;
};

// watches
watch(remoteMode, () => notifyModeChanges(), { immediate: true });
watch(error, v => v === null ? emit('valid') : emit('invalid'), { immediate: true });

watch(remoteValue, function (n) {
  if (n === undefined) {
    // have remote > no remote
    if ((props.model as any).value === undefined) {
      emit('input', (props.converter as any)(null));
    }
  } else {
    // no remote > have remote || remote changed
    // we assume the new remote value is always the same as local one due to we use local value to execute update on the remote
    emit('input', undefined);
  }
});

watch(() => state.parent, function (n, o) {
  if (n && o === null) {
    // no parent > have parent
    if (mode.value !== 'base') {
      change('base');
    }
  } else if (n === null && o) {
    // have parent > no parent
    if (mode.value === 'base') {
      if (remoteMode.value === 'base') {
        change('disabled');
      } else {
        change(remoteMode.value || 'disabled');
      }
    }
  }
});
</script>
