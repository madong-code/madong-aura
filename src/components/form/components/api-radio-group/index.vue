<script setup lang="ts">
import { computed } from 'vue';

import ApiComponent from '../api-component/index.vue';
import RadioGroup from '../radio-group/index.vue';

const props = defineProps<{
  isBtn?: boolean;
  modelValue?: boolean | number | string | undefined;
  size?: 'default' | 'large' | 'small' | undefined;
}>();

const emit = defineEmits<{
  'update:modelValue': [modelValue: boolean | number | string | undefined];
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
    model-prop-name="value"
    :component="RadioGroup"
  />
</template>
