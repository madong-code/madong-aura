<script setup lang="ts">
import { computed, useSlots } from 'vue';

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits<{
  'update:modelValue': [modelValue: any];
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
  <ElDatePicker v-model="value">
    <template v-for="(_, slotName) in slots" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </ElDatePicker>
</template>
