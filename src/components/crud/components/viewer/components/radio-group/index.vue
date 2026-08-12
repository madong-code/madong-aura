<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    data?: Record<string, any>;
    fieldName?: string;
    options?: {
      label: string;
      value: number | string;
    }[];
    schema?: any;
    value?: null | number | string | undefined;
  }>(),
  {},
);

const displayLabel = computed(() => {
  if (!props.options || props.options.length === 0) {
    return props.value;
  }
  if (props.value === undefined || props.value === null) {
    return undefined;
  }
  const option = props.options.find((opt) => opt.value === props.value);
  return option ? option.label : props.value;
});
</script>

<template>
  <span class="reader-radio-group">
    <template v-if="displayLabel !== undefined">
      {{ displayLabel }}
    </template>
    <span v-else class="empty-value">--</span>
  </span>
</template>

<style lang="scss" scoped>
.reader-radio-group {
  .empty-value {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
