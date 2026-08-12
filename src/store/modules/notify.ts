import type { UnreadCountData } from '#/api/content/message/notify/types';

import { ref } from 'vue';

import { defineStore } from 'pinia';

import { CategoryService } from '#/api/content/message/category';
import { NotifyService } from '#/api/content/message/notify';
import { useUserStore } from '#/core/stores';
// @ts-expect-error: push-vue.js has no type declarations
import { Push } from '#/utils/push/push-vue.js';

// 全局 Push 连接（Store 多次创建时复用）
let pushClient: InstanceType<typeof Push> | null = null;

export const useNotifyStore = defineStore('notify', () => {
  // ========== 状态 ==========
  const unreadCount = ref<UnreadCountData>({ total: 0, categories: [] });
  const messageList = ref<any[]>([]);
  const totalItems = ref(0);
  const loading = ref(false);
  const pushConnected = ref(false);

  // ========== 订阅相关已移除：subscribe-page 直接调用 API ==========

  // ========== Push 连接管理 ==========
  function initPush() {
    if (pushClient) return;

    const wssEnabled = import.meta.env.VITE_GLOB_ENABLE_WSS === 'true';
    if (!wssEnabled) return;

    const wssUrl = import.meta.env.VITE_GLOB_WSS_URL;
    const appKey = import.meta.env.VITE_GLOB_WSS_APPKEY;
    if (!wssUrl || !appKey) {
      console.warn('[NotifyStore] WSS 未配置');
      return;
    }

    const userStore = useUserStore();
    const userId = (userStore.userInfo as Record<string, any>)?.id || '0';

    pushClient = new Push({
      url: wssUrl,
      app_key: appKey,
      auth: '/adminapi/plugin/webman/push/auth',
    });

    // 订阅个人消息通道 backend-admin-{userId}（单租户，无租户维度）
    const channel = pushClient.subscribe(`backend-admin-${userId}`);
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
    loadUnreadCount();
  }

  function destroyPush() {
    // Push 连接由 Push 内部管理生命周期，不主动断开
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
    pushClient = null;
  }

  // ========== 工具函数 ==========
  function normalizeItem(item: any): any {
    return {
      id: item.id,
      definition_id: item.definition_id,
      category: item.category_id ?? 0,
      category_name: item.category_name,
      module_id: item.definition_id, // 兼容旧引用
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
