<script setup lang="ts">
import { computed } from 'vue';

import { ElCheckbox, ElCheckboxButton, ElCheckboxGroup } from 'element-plus';

interface Option {
  label: string;
  value: number | string;
  disabled?: boolean;
  bgColor?: string;
  textColor?: string;
}

const props = withDefaults(
  defineProps<{
    isBtn?: boolean;
    modelValue?: Array<number | string>;
    options?: Option[];
    size?: 'default' | 'large' | 'small';
  }>(),
  { modelValue: () => [], isBtn: false },
);

const emit = defineEmits<{
  'update:modelValue': [modelValue: Array<number | string> | undefined];
}>();

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

defineExpose({
  getValue() {
    return value.value;
  },
});
</script>

<template>
  <ElCheckboxGroup v-model="value">
    <template v-if="isBtn">
      <ElCheckboxButton
        :size="size"
        v-for="item in options || []"
        :key="`${item.value}`"
        :value="item.value"
        >{{ item.label }}</ElCheckboxButton
      >
    </template>
    <template v-else>
      <ElCheckbox
        :size="size"
        v-for="item in options"
        :key="`${item.value}`"
        :value="item.value"
        >{{ item.label }}</ElCheckbox
      >
    </template>
  </ElCheckboxGroup>
</template>
