<script setup lang="ts">
import { computed } from 'vue';

import { cn } from '#/core/shared/utils';

const props = withDefaults(
  defineProps<{
    class?: any;
    content?: string;
    minHeight?: number | string;
  }>(),
  {
    class: '',
    content: '',
    minHeight: 320,
  },
);

const contentMinHeight = computed(() =>
  typeof props.minHeight === 'number'
    ? `${props.minHeight}px`
    : props.minHeight,
);

const previewClass = computed(() =>
  cn(
    'vben-wangeditor-preview',
    'bg-transparent p-4 leading-7 text-foreground',
    props.class,
  ),
);
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    :class="previewClass"
    :style="{ minHeight: contentMinHeight }"
    v-html="content"
  ></div>
</template>

<style scoped>
/* 预览表格边框（wangEditor 编辑时有边框，预览需补充） */
.vben-wangeditor-preview :deep(table) {
  width: 100%;
  margin: 8px 0;
  border-collapse: collapse;
}

.vben-wangeditor-preview :deep(table th),
.vben-wangeditor-preview :deep(table td) {
  min-width: 60px;
  padding: 8px 12px;
  border: 1px solid hsl(var(--border));
}

.vben-wangeditor-preview :deep(table th) {
  font-weight: 600;
  background-color: hsl(var(--accent));
}
</style>
