<script setup lang="ts">
import { computed } from 'vue';

import { IconPicker } from '#/core/ui/common';

const props = defineProps<{
  modelValue: string | undefined;
}>();

const emit = defineEmits<{
  'update:modelValue': [modelValue: string | undefined];
}>();

const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

defineExpose({
  getValue() {
    return value.value;
  },
});
</script>

<template>
  <IconPicker v-model="value" />
</template>
