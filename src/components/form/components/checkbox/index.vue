<script setup lang="ts">
import { computed } from 'vue';

import { ElCheckbox } from 'element-plus';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean | string | number;
    label?: string;
    disabled?: boolean;
    trueValue?: boolean | string | number;
    falseValue?: boolean | string | number;
  }>(),
  {
    modelValue: false,
    trueValue: true,
    falseValue: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [v: boolean | string | number];
}>();

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

defineExpose({
  getValue() {
    return value.value;
  },
});
</script>

<template>
  <ElCheckbox
    v-model="value"
    :true-value="(trueValue as any)"
    :false-value="(falseValue as any)"
    :disabled="disabled"
  >
    {{ label }}
  </ElCheckbox>
</template>
