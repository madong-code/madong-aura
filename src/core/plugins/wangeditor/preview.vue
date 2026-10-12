<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { cn } from '#/core/shared/utils';
import { signContentImages } from '#/utils/url/private-storage';

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

// 预览内容是富文本 HTML：私有存储下图片需换取签名地址后才能显示
const rootRef = ref<HTMLElement | null>(null);

let contentObserver: MutationObserver | null = null;

const syncContentImages = async () => {
  await nextTick();
  void signContentImages(rootRef.value);
};

watch(
  () => props.content,
  () => {
    void syncContentImages();
  },
);

onMounted(() => {
  void syncContentImages();
  if (rootRef.value) {
    contentObserver = new MutationObserver(() => {
      void syncContentImages();
    });
    contentObserver.observe(rootRef.value, {
      attributes: true,
      attributeFilter: ['src'],
      childList: true,
      subtree: true,
    });
  }
});

onBeforeUnmount(() => {
  contentObserver?.disconnect();
  contentObserver = null;
});

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
    ref="rootRef"
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
