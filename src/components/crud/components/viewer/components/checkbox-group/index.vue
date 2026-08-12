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
    value?: (number | string)[] | null | string | undefined;
  }>(),
  {},
);

const displayLabels = computed(() => {
  const options = props.options;
  if (!options || options.length === 0) {
    return [];
  }

  let values: (number | string)[] = [];
  if (Array.isArray(props.value)) {
    values = props.value;
  } else if (typeof props.value === 'string') {
    values = props.value.split(',');
  } else if (props.value !== undefined && props.value !== null) {
    values = [props.value];
  }

  return values
    .map((val) => {
      const option = options.find((opt) => opt.value === val);
      return option ? option.label : val;
    })
    .filter(Boolean);
});
</script>

<template>
  <span class="reader-checkbox-group">
    <template v-if="displayLabels.length > 0">
      {{ displayLabels.join(', ') }}
    </template>
    <span v-else class="empty-value">--</span>
  </span>
</template>

<style lang="scss" scoped>
.reader-checkbox-group {
  .empty-value {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
