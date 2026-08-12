<script setup lang="ts">
import { computed } from 'vue';

import { ElRadio, ElRadioButton, ElRadioGroup } from 'element-plus';

interface Option {
  label: string;
  value: number | string;
  disabled?: boolean;
}

const props = defineProps<{
  isBtn?: boolean;
  modelValue?: boolean | number | string | undefined;
  options?: Option[];
  size?: 'default' | 'large' | 'small' | undefined;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean | number | string | undefined];
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
  <ElRadioGroup v-model="value">
    <template v-if="isBtn">
      <ElRadioButton
        :size="size"
        v-for="item in options || []"
        :key="`${item.value}`"
        :value="item.value"
        >{{ item.label }}</ElRadioButton
      >
    </template>
    <template v-else>
      <ElRadio
        :size="size"
        v-for="item in options || []"
        :key="`${item.value}`"
        :value="item.value"
        >{{ item.label }}</ElRadio
      >
    </template>
  </ElRadioGroup>
</template>
