<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenDrawer } from '#/core/ui/common';
import { $t } from '#/locales';
import { useNotifyStore } from '#/store/modules/notify';
import MessageCenter from '#/views/content/message/notify/index.vue';

const route = useRoute();
const notifyStore = useNotifyStore();
const drawerActiveTab = ref<'all' | 'unread'>('unread');

const [Drawer, drawerApi] = useVbenDrawer({
  placement: 'right',
  closable: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
});

// 保险：抽屉打开期间发生任何路由跳转自动关闭（覆盖阅读面板、订阅设置等所有跳转路径）
watch(
  () => route.fullPath,
  () => {
    drawerApi.close();
  },
);

// 每次打开抽屉时递增，强制 MessageCenter 重建，重新执行 onMounted
const messageKey = ref(0);

function open() {
  drawerActiveTab.value = 'unread';
  messageKey.value++;
  notifyStore.loadUnreadCount();
  drawerApi.open();
}

function close() {
  drawerApi.close();
}

defineExpose({ open, close });
</script>

<template>
  <Drawer :footer="false" class="w-[80%]">
    <template #title>
      <div class="flex items-center gap-2 text-sm">
        <button
          class="font-medium transition-colors"
          :class="
            drawerActiveTab === 'unread'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="drawerActiveTab = 'unread'"
        >
          {{ $t('content.message.notify.tabs.unread') }}
          <span
            v-if="notifyStore.unreadCount.total > 0"
            class="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] text-white"
          >
            {{
              notifyStore.unreadCount.total > 99
                ? '99+'
                : notifyStore.unreadCount.total
            }}
          </span>
        </button>
        <span class="text-muted-foreground/20">|</span>
        <button
          class="font-medium transition-colors"
          :class="
            drawerActiveTab === 'all'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="drawerActiveTab = 'all'"
        >
          {{ $t('content.message.notify.tabs.all') }}
        </button>
      </div>
    </template>
    <MessageCenter
      :key="messageKey"
      :active-tab="drawerActiveTab"
      @update:active-tab="drawerActiveTab = $event"
      @navigate="close"
    />
  </Drawer>
</template>
