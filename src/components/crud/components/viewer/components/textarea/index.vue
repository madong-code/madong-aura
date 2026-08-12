<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    data?: Record<string, any>;
    fieldName?: string;
    /** 是否尝试格式化 JSON */
    formatJson?: boolean;
    rows?: number;
    schema?: any;
    value?: null | number | string | undefined;
  }>(),
  {
    data: () => ({}),
    fieldName: '',
    rows: 3,
    formatJson: false,
    schema: () => ({}),
    value: undefined,
  },
);

const displayValue = computed(() => {
  const raw = props.value;
  if (raw === undefined || raw === null || raw === '') return '';
  if (props.formatJson) {
    try {
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return JSON.stringify(obj, null, 2);
    } catch {
      return raw;
    }
  }
  return raw;
});

const lineHeight = 1.6;
const textareaStyle = computed(() => {
  const h = props.rows * lineHeight;
  return {
    minHeight: `${h}em`,
    maxHeight: `${h}em`,
  };
});
</script>

<template>
  <span class="reader-textarea" :style="textareaStyle">
    <template v-if="displayValue !== ''">
      <pre>{{ displayValue }}</pre>
    </template>
    <span v-else class="empty-value">--</span>
  </span>
</template>

<style lang="scss" scoped>
.reader-textarea {
  display: block;
  overflow-y: auto;

  pre {
    padding: 0;
    margin: 0;
    line-height: 1.6;
    word-break: break-all;
    white-space: pre-wrap;
  }

  .empty-value {
    line-height: 1.6;
    color: var(--el-text-color-placeholder, #94a3b8);
  }
}
</style>
