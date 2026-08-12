<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';

import { ElButton } from 'element-plus';

import { Icon } from '#/components/icon';
import { WangEditor } from '#/core/plugins/wangeditor';
import { useAccessStore } from '#/core/stores';

const props = withDefaults(
  defineProps<{
    editable?: boolean;
    excludeKeys?: string[];
    height?: string;
    insertKeys?: { index: number; keys: string[] };
    mode?: 'default' | 'simple';
    modelValue?: string;
    placeholder?: string;
    previewable?: boolean;
    toolbar?: boolean;
    toolbarKeys?: string[];
    uploadConfig?: Record<string, any>;
  }>(),
  {
    modelValue: '',
    height: '500px',
    mode: 'default',
    placeholder: '',
    toolbarKeys: undefined,
    insertKeys: undefined,
    excludeKeys: undefined,
    uploadConfig: undefined,
    editable: true,
    toolbar: true,
    previewable: true,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

// 合并上传配置：URL 前缀与鉴权头由包装器统一处理，schema 只传路径
const mergedUploadConfig = computed(() => {
  const custom = props.uploadConfig || {};
  let server = custom.server || '/adminapi/system/files/common/wangeditor';
  // 相对路径统一拼接 API 基础地址（VITE_GLOB_API_URL），绝对 URL 或已带前缀的路径直接使用
  const apiBase = import.meta.env.VITE_GLOB_API_URL || '';
  if (apiBase && !/^https?:\/\//i.test(server) && !server.startsWith(apiBase)) {
    server = apiBase + server;
  }

  // wangeditor 使用原生 fetch 上传，不会走 requestClient 拦截器，需手动注入鉴权头
  const accessStore = useAccessStore();
  const headers: Record<string, string> = { ...custom.headers };
  if (accessStore.accessToken) {
    headers.Authorization = `Bearer ${accessStore.accessToken}`;
  }

  return { ...custom, server, headers };
});

const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: string) {
    emit('update:modelValue', val);
  },
});

const slots = useSlots();

const fullscreen = ref(false);

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value;
}

defineExpose({
  getValue() {
    return value.value;
  },
});
</script>

<template>
  <div
    class="wangeditor-wrapper"
    :class="[{ 'wangeditor-fullscreen': fullscreen }]"
  >
    <WangEditor
      v-model="value"
      :height="height"
      :mode="mode"
      :placeholder="placeholder"
      :toolbar-keys="toolbarKeys"
      :insert-keys="insertKeys"
      :exclude-keys="excludeKeys"
      :upload-config="mergedUploadConfig"
      :editable="editable"
      :toolbar="toolbar"
      :previewable="previewable"
      v-bind="$attrs"
    >
      <template v-for="(_, slotName) in slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps"></slot>
      </template>
    </WangEditor>

    <!-- 全屏按钮 -->
    <div class="wangeditor-fullscreen-btn">
      <ElButton
        :aria-label="fullscreen ? '退出全屏' : '全屏'"
        text
        size="small"
        @click="toggleFullscreen"
      >
        <Icon
          :icon="
            fullscreen
              ? 'fluent:full-screen-minimize-24-regular'
              : 'fluent:full-screen-maximize-24-regular'
          "
        />
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.wangeditor-wrapper {
  position: relative;
  overflow: hidden;
}

.wangeditor-fullscreen-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.wangeditor-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: hsl(var(--card));
}

.wangeditor-fullscreen :deep(.editor-wrapper) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.wangeditor-fullscreen :deep(.w-e-text-container) {
  flex: 1;
  overflow-y: auto;
}
</style>
