<script setup lang="ts">
import { computed, useSlots } from 'vue';

import { ElSelectV2 } from 'element-plus';

interface Option {
  label: string;
  value: number | string;
  disabled?: boolean;
}

const props = defineProps<{
  modelValue?: Array<number | string> | null | number | string | undefined;
  options?: Option[];
}>();

const emit = defineEmits<{
  'update:modelValue': [
    modelValue: Array<number | string> | null | number | string | undefined,
  ];
}>();

const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const slots = useSlots();

defineExpose({
  getValue() {
    return value.value;
  },
});
</script>

<template>
  <ElSelectV2 v-model="value" :options="options || []">
    <template v-for="(_, slotName) in slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </ElSelectV2>
</template>
