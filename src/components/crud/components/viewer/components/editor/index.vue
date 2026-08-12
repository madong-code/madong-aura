<script setup lang="ts">
withDefaults(
  defineProps<{
    data?: Record<string, any>;
    fieldName?: string;
    schema?: any;
    value?: null | string;
  }>(),
  {
    value: '',
  },
);
</script>

<template>
  <div class="reader-editor">
    <template v-if="value">
      <div class="editor-content" v-html="value"></div>
    </template>
    <span v-else class="empty-value">--</span>
  </div>
</template>

<style lang="scss" scoped>
.reader-editor {
  width: 100%;
  font-size: 14px;
  line-height: 1.6;
  color: hsl(var(--foreground));
}

.editor-content {
  word-break: break-all;

  /* 重置富文本内容的样式 */
  :deep(p) {
    margin: 0 0 8px;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
  }

  :deep(table) {
    width: 100%;
    margin: 8px 0;
    border-collapse: collapse;
  }

  :deep(th),
  :deep(td) {
    padding: 6px 12px;
    border: 1px solid hsl(var(--border));
  }
}

.empty-value {
  font-style: italic;
  color: hsl(var(--muted-foreground));
}
</style>
