<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';

/**
 * 查看器单项渲染异常边界：子树渲染抛错时仅当前项回退为空值占位，
 * 阻断错误冒泡，保证详情页其他字段与页面整体不受影响。
 */
const props = defineProps<{
  /** 出错字段名（供日志定位） */
  fieldName?: string;
}>();

const hasError = ref(false);

onErrorCaptured((error, _instance, info) => {
  hasError.value = true;
  console.error(
    `[DetailViewer] 字段「${props.fieldName ?? '未知'}」渲染异常(${info}):`,
    error,
  );
  return false;
});
</script>

<template>
  <template v-if="hasError">
    <span class="viewer-item-boundary-fallback">--</span>
  </template>
  <slot v-else></slot>
</template>

<style lang="scss" scoped>
.viewer-item-boundary-fallback {
  color: var(--el-text-color-placeholder, #94a3b8);
}
</style>
