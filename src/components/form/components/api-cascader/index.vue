<script setup lang="ts">
import { computed } from 'vue';

import { ElCascader } from 'element-plus';

import ApiComponent from '../api-component/index.vue';

const props = withDefaults(
  defineProps<{
    childrenField?: string;
    labelField?: string;
    modelValue?: Array<number | string>;
    valueField?: string;
  }>(),
  {
    modelValue: () => [],
    valueField: 'id',
    labelField: 'name',
    childrenField: 'children',
  },
);

const emit = defineEmits<{
  'update:modelValue': [modelValue: Array<number | string> | undefined];
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
    :component="ElCascader"
    :value-field="valueField"
    :label-field="labelField"
    :children-field="childrenField"
    style="width: 100%"
  />
</template>
