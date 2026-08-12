<script setup lang="ts">
import { computed } from 'vue';

import { ElTreeSelect } from 'element-plus';

import ApiComponent from '../api-component/index.vue';

const props = withDefaults(
  defineProps<{
    childrenField?: string;
    labelField?: string;
    modelValue?: Array<number | string> | null | number | string | undefined;
    valueField?: string;
  }>(),
  {
    valueField: 'id',
    labelField: 'name',
    childrenField: 'children',
  },
);

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
    :component="ElTreeSelect"
    options-prop-name="data"
    :value-field="valueField"
    :label-field="labelField"
    :children-field="childrenField"
    v-bind="$attrs"
  />
</template>
