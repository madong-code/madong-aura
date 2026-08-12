<script setup lang="ts">
import { computed } from 'vue';

import ApiComponent from '../api-component/index.vue';
import CheckboxGroup from '../checkbox-group/index.vue';

const props = withDefaults(
  defineProps<{
    isBtn?: boolean;
    modelValue?: Array<number | string>;
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

defineExpose({ getValue: () => value.value });
</script>

<template>
  <ApiComponent v-model="value" :component="CheckboxGroup" />
</template>
