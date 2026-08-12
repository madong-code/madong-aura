<script lang="ts" setup>
import { useVbenDrawer } from '#/core/ui/common';
import NotepadPage from '#/views/content/notepad/index.vue';

const [Drawer, drawerApi] = useVbenDrawer({
  placement: 'right',
  closable: false,
  footer: false,
  header: false,
  destroyOnClose: true,
  // 覆盖内容区默认的 overflow-y-auto，禁止整体滚动
  contentClass: '!overflow-hidden !p-0',
});

function open() {
  drawerApi.open();
}

function close() {
  drawerApi.close();
}

/** 处理页面内关闭事件 */
function handleClose() {
  drawerApi.close();
}

defineExpose({ open, close });
</script>

<template>
  <!-- 单个抽屉：桌面端85%宽，移动端全屏，无默认标题，禁止整体滚动 -->
  <Drawer class="w-full max-w-[85vw]" @close="handleClose">
    <NotepadPage @close="handleClose" />
  </Drawer>
</template>
