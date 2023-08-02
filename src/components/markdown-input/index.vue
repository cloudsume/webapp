<template>
  <BCard body-class="p-2">
    <!-- toolbar -->
    <div class="d-flex align-items-center mb-2">
      <!-- toolbar -->
      <BButtonToolbar class="flex-grow-1">
        <BButtonGroup size="sm">
          <BButton :disabled="disabled" variant="light" @click="insertUnorderedList">
            <BIconListUl></BIconListUl>
          </BButton>
        </BButtonGroup>
      </BButtonToolbar>
      <!-- markdown icon -->
      <BIconMarkdown></BIconMarkdown>
    </div>
    <!-- input -->
    <textarea ref="input" :id="inputId" :readonly="disabled" :class="inputClasses" rows="6" @input="update"></textarea>
  </BCard>
</template>

<script setup lang="ts">
import { BButton, BButtonGroup, BButtonToolbar, BCard, BIconListUl, BIconMarkdown } from 'bootstrap-vue';
import { onMounted, ref, Ref, watch } from 'vue';
import { bind } from '@/util/binder';
import { computed } from '@/util/computed';
import { charBefore, trimLeftNonLF, trimRightNonLF } from '@/util/string';

// props & emit
const props = defineProps({
  inputId: String,
  disabled: Boolean,
  state: {
    type: Boolean,
    default: null
  },
  value: {
    type: String,
    default: ''
  }
});

const emit = defineEmits<{
  (e: 'input', v: string): void;
}>();

// local states
const input: Ref<HTMLTextAreaElement | null> = ref(null);

// computed
const inputClasses = computed(function () {
  const classes: Record<string, boolean> = {
    'form-control': true
  };

  if (props.state === true) {
    classes['is-valid'] = true;
  } else if (props.state === false) {
    classes['is-invalid'] = true;
  }

  return classes;
});

// functions
const insertUnorderedList = bind({ input }, function () {
  const input = this.input.value;

  if (!input) {
    throw new Error('No reference to the input element.');
  }

  // determine where to insert a "-"
  let text = input.value;
  let start = input.selectionStart;
  let end = input.selectionEnd;

  if (!text.length) {
    // the current text is empty
    text = '- ';
    end = start = text.length;
  } else if (start === text.length) {
    // there is some text and the cursor is at the end of the text
    text = trimRightNonLF(text);

    if (charBefore(text, text.length) === '\n') {
      // the cursor is at the beginning of the new line
      text += '- ';
    } else {
      // the cursor is at the end of the line
      text += '\n\n- ';
    }

    end = start = text.length;
  } else if (start === end) {
    // there is some text and the cursor is at the beginning or in the middle of the text
    const before = trimRightNonLF(text.slice(0, start));
    const after = trimLeftNonLF(text.slice(start));

    if (!before || charBefore(before, before.length) === '\n') {
      text = before + '- ' + after;
      end = start = before.length + 2;
    } else {
      text = before + '\n\n- ' + after;
      end = start = before.length + 4;
    }
  } else {
    // there are a selection with some text
    const before = trimRightNonLF(text.slice(0, start));
    const items = text.slice(start, end).trim().split('\n').map(l => `- ${l.trim()}`).join('\n');
    const after = trimLeftNonLF(text.slice(end));

    if (!before || charBefore(before, before.length) === '\n') {
      text = before + items;
    } else {
      text = before + '\n\n' + items;
    }

    end = start = text.length;

    if (after) {
      if (after.charAt(0) !== '\n') {
        text += '\n\n';
      }

      text += after;
    }
  }

  // update text
  input.value = text;
  input.setSelectionRange(start, end);
  input.focus();

  emit('input', text); // setting the value of HTMLTextAreaElement does not trigger "input" event
});

const update = function (e: Event) {
  emit('input', (e.target as HTMLTextAreaElement).value);
};

// watches
watch(() => props.value, bind({ input }, function (v) {
  const input = this.input.value;

  if (!input) {
    throw new Error('No reference to the input element.');
  } else if (input.value === v) {
    return;
  }

  input.value = v;
})); // we can't use immediate here because the input reference is not available yet

// lifecycle hooks
onMounted(function () {
  if (!input.value) {
    throw new Error('No reference to the input element.');
  }

  input.value.value = props.value;
});
</script>
