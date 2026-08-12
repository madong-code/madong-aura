<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    data?: Record<string, any>;
    fieldName?: string;
    rows?: number;
    schema?: any;
    type?: string;
    value?: null | number | string | undefined;
  }>(),
  {
    type: 'text',
    rows: 1,
  },
);

const isMultiline = computed(() => {
  return props.type === 'textarea' || props.rows > 1;
});
</script>

<template>
  <span
    class="reader-input"
    :class="[{ 'reader-input-multiline': isMultiline }]"
  >
    <template v-if="value !== undefined && value !== null">
      <template v-if="isMultiline">
        <pre>{{ value }}</pre>
      </template>
      <template v-else>
        {{ value }}
      </template>
    </template>
    <span v-else class="empty-value">--</span>
  </span>
</template>

<style lang="scss" scoped>
.reader-input {
  display: inline-block;

  &-multiline {
    pre {
      margin: 0;
      line-height: 1.6;
      word-break: break-all;
      white-space: pre-wrap;
    }
  }

  .empty-value {
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
