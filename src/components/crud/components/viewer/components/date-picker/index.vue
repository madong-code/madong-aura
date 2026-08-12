<script setup lang="ts">
import { computed } from 'vue';

import { formatDate } from '#/utils';

const props = withDefaults(
  defineProps<{
    data?: Record<string, any>;
    fieldName?: string;
    format?: string;
    schema?: any;
    type?: string;
    value?: Date | null | number | string | undefined;
  }>(),
  {
    data: () => ({}),
    fieldName: '',
    format: 'YYYY-MM-DD HH:mm:ss',
    schema: () => ({}),
    type: 'date',
    value: undefined,
  },
);

const formattedValue = computed(() => {
  if (props.value === undefined || props.value === null) return '';
  return formatDate(props.value, props.format as any);
});
</script>

<template>
  <span class="reader-date-picker">
    <template v-if="value !== undefined && value !== null">
      {{ formattedValue }}
    </template>
    <span v-else class="empty-value">--</span>
  </span>
</template>

<style lang="scss" scoped>
.reader-date-picker {
  .empty-value {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
