import type { UnreadCountData } from '#/api/content/message/notify/types';

import { ref } from 'vue';

import { defineStore } from 'pinia';

import { CategoryService } from '#/api/content/message/category';
import { NotifyService } from '#/api/content/message/notify';
import { useUserStore } from '#/core/stores';

import { subscribeUserChannel, resetPushClient } from '#/utils/push/client';

let isInitialized = false;

export const useNotifyStore = defineStore('notify', () => {
  // ========== 状态 ==========
  const unreadCount = ref<UnreadCountData>({ total: 0, categories: [] });
  const messageList = ref<any[]>([]);
  const totalItems = ref(0);
  const loading = ref(false);
  const pushConnected = ref(false);

  // ========== Push 连接管理 ==========
  function initPush() {
    if (isInitialized) return;

    const userStore = useUserStore();
    const userId = (userStore.userInfo as Record<string, any>)?.id || '0';

    const channel = subscribeUserChannel(String(userId));

    // WSS 未启用（如 mock 联调期）：退化为 REST 拉取未读数，保证红点可用
    if (!channel) {
      isInitialized = true;
      loadUnreadCount();
      return;
    }

    channel.on('message', (data: any) => {
      const messages = data.messages || data;
      const list = Array.isArray(messages) ? messages : [messages];
      for (const msg of list) {
        if (msg.type === 'unread_count' && msg.data) {
          unreadCount.value = {
            total: msg.data.total ?? 0,
            categories: msg.data.categories ?? [],
          };
        }
      }
    });

    pushConnected.value = true;
    isInitialized = true;
    loadUnreadCount();
    console.log('[NotifyStore] 通知推送已初始化');
  }

  function destroyPush() {
    isInitialized = false;
    pushConnected.value = false;
  }

  // ========== 数据加载 ==========
  async function loadMessages(params: {
    category_id?: number;
    definition_id?: number;
    keyword?: string;
    page: number;
    pageSize: number;
    status?: string;
  }) {
    loading.value = true;
    try {
      const resp = await NotifyService.getList({
        page: params.page,
        limit: params.pageSize,
        status: params.status,
        category_id: params.category_id,
        definition_id: params.definition_id,
        keyword: params.keyword,
      });
      messageList.value = (resp.list ?? []).map((item) => normalizeItem(item));
      totalItems.value = resp.total ?? 0;
    } catch (error) {
      console.error('[NotifyStore] 加载消息列表失败:', error);
    } finally {
      loading.value = false;
    }
  }

  async function loadUnreadCount() {
    try {
      unreadCount.value = await NotifyService.getUnreadCount();
    } catch (error) {
      console.error('[NotifyStore] 加载未读数失败:', error);
    }
  }

  async function loadCategories() {
    try {
      return await CategoryService.getAll();
    } catch (error) {
      console.error('[NotifyStore] 加载分类失败:', error);
      return [];
    }
  }

  // ========== 消息操作 ==========
  async function markRead(id: number | string) {
    try {
      await NotifyService.markRead(id);
      await loadUnreadCount();
    } catch (error) {
      console.error('[NotifyStore] 标记已读失败:', error);
    }
  }

  async function batchMarkRead(ids: (number | string)[]) {
    try {
      await NotifyService.batchMarkRead(ids);
      await loadUnreadCount();
    } catch (error) {
      console.error('[NotifyStore] 批量标记已读失败:', error);
    }
  }

  async function markAllRead() {
    try {
      await NotifyService.markAllRead();
      messageList.value.forEach((n) => (n.isRead = true));
      await loadUnreadCount();
    } catch (error) {
      console.error('[NotifyStore] 全部标记已读失败:', error);
    }
  }

  async function batchDelete(ids: (number | string)[]) {
    try {
      await NotifyService.batchDelete(ids);
      messageList.value = messageList.value.filter((n) => !ids.includes(n.id));
      await loadUnreadCount();
    } catch (error) {
      console.error('[NotifyStore] 批量删除失败:', error);
    }
  }

  // ========== 重置状态（用于登出时清空） ==========
  function $reset() {
    unreadCount.value = { total: 0, categories: [] };
    messageList.value = [];
    totalItems.value = 0;
    loading.value = false;
    pushConnected.value = false;
    isInitialized = false;
    resetPushClient();
  }

  // ========== 工具函数 ==========
  function normalizeItem(item: any): any {
    return {
      id: item.id,
      definition_id: item.definition_id,
      category: item.category_id ?? 0,
      category_name: item.category_name,
      module_id: item.definition_id,
      module_name: item.definition_name ?? item.module_name,
      title: item.title ?? '',
      content: item.content ?? '',
      date: item.created_at
        ? new Date(item.created_at).toLocaleString('zh-CN', { hour12: false })
        : '',
      isRead: item.status === 'read',
      link: item.action_url ?? '',
      query: item.action_params
        ? typeof item.action_params === 'string'
          ? JSON.parse(item.action_params)
          : item.action_params
        : {},
      actionText: '立即查看',
      priority: item.priority,
      sender_id: item.sender_id,
      read_at: item.read_at,
      created_at: item.created_at,
    };
  }

  return {
    $reset,
    unreadCount,
    messageList,
    totalItems,
    loading,
    pushConnected,

    initPush,
    destroyPush,

    loadMessages,
    loadUnreadCount,
    loadCategories,

    markRead,
    batchMarkRead,
    markAllRead,
    batchDelete,
  };
});
