<script setup lang="ts">
import { computed } from 'vue';

import ApiComponent from '../api-component/index.vue';
import Select from '../select/index.vue';

const props = defineProps<{
  modelValue?: Array<number | string> | null | number | string | undefined;
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

defineExpose({
  getValue() {
    return value.value;
  },
});
</script>

<template>
  <ApiComponent
    v-model="value"
    model-prop-name="modelValue"
    :component="Select"
  />
</template>
