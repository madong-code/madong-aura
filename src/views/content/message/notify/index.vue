<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { ChevronLeft, Mail, Search, Settings, Trash2 } from 'lucide-vue-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { NotifyService } from '#/api/content/message/notify';
import { $t } from '#/locales';
import { useNotifyStore } from '#/store/modules/notify';
import { canAccessRoute, isExternalLink, navigateToTarget } from '#/utils/navigation';

const props = withDefaults(
  defineProps<{
    /** Drawer 模式：由父容器控制 activeTab；页面模式：内部管理 */
    activeTab?: 'all' | 'unread';
  }>(),
  {
    activeTab: undefined,
  },
);
const emit = defineEmits<{
  (e: 'update:activeTab', value: 'all' | 'unread'): void;
  /** 路由跳转成功后通知父级（Drawer 模式下关闭抽屉自身） */
  (e: 'navigate'): void;
}>();

const router = useRouter();
const notifyStore = useNotifyStore();

// ==================== 状态 ====================
const internalActiveTab = ref<'all' | 'unread'>('unread');
const activeCategory = ref<number | string>(0); // 0=全部, string=雪花ID
const searchKeyword = ref('');
const selectedCount = ref(0);
const selectedRecords = ref<any[]>([]); // 从 gridEvents 维护，避免依赖 gridApi.grid

/** 文本阅读面板：当前阅读的消息（null=列表模式） */
const detailItem = ref<any | null>(null);
/** 打开阅读面板时该消息是否未读（关闭时用于刷新列表） */
const detailWasUnread = ref(false);

/** 当前使用的 tab（优先外部 props） */
const currentTab = computed(() => props.activeTab ?? internalActiveTab.value);

function setActiveTab(tab: 'all' | 'unread') {
  if (props.activeTab === undefined) {
    internalActiveTab.value = tab;
  } else {
    emit('update:activeTab', tab);
  }
}

// ==================== 可拖拽左侧栏宽度 ====================
const sidebarWidth = ref(200);
const isDragging = ref(false);

function onResizeStart(e: MouseEvent) {
  isDragging.value = true;
  const startX = e.clientX;
  const startWidth = sidebarWidth.value;

  function onMouseMove(ev: MouseEvent) {
    const delta = ev.clientX - startX;
    const newWidth = Math.max(120, Math.min(360, startWidth + delta));
    sidebarWidth.value = newWidth;
  }

  function onMouseUp() {
    isDragging.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// ==================== 生命周期 ====================
onMounted(() => {
  notifyStore.loadCategories().then((cats) => {
    categoryOptions.value = Array.isArray(cats) ? cats : [];
  });
  // 加载未读数 + 连接 WebSocket 推送
  notifyStore.loadUnreadCount();
  notifyStore.initPush();
});

// ==================== 数据 ====================
const categoryOptions = ref<any[]>([]);

/** 未读数按 (id / key) 构建查找表，兼容后端返回的多种 ID 格式 */
const unreadCountMap = computed(() => {
  const map = new Map<string, number>();
  for (const c of notifyStore.unreadCount.categories ?? []) {
    if (c.category_id !== null && c.category_id !== undefined)
      map.set(String(c.category_id), c.count);
    if (c.key !== null && c.key !== undefined) map.set(c.key, c.count);
  }
  return map;
});

// 左侧始终显示所有分类（含未读数）
const displayCategories = computed(() => {
  const cats = categoryOptions.value.map((cat: any) => ({
    ...cat,
    unreadCount:
      unreadCountMap.value.get(String(cat.id)) ??
      (cat.key ? unreadCountMap.value.get(cat.key) : 0) ??
      0,
  }));
  return [
    {
      id: 0,
      name: $t('content.message.notify.sidebar.all_types'),
      unreadCount: notifyStore.unreadCount.total,
    },
    ...cats,
  ];
});

// ==================== vxe-grid 配置 ====================
const gridOptions = {
  border: 'none' as any,
  checkboxConfig: { highlight: true, reserve: true, checkKey: 'id' },
  columns: [
    { type: 'checkbox' as const, width: 50 },
    {
      slots: { default: 'view' },
      title: $t('content.message.notify.table.columns.view'),
      width: 50,
    },
    {
      field: 'title',
      slots: { default: 'title' },
      title: $t('content.message.notify.table.columns.title'),
      minWidth: 150,
      align: 'left' as const,
    },
    {
      slots: { default: 'content' },
      title: $t('content.message.notify.table.columns.content'),
      minWidth: 200,
      align: 'left' as const,
    },
    {
      field: 'category_name',
      title: $t('content.message.notify.table.columns.type'),
      width: 90,
      align: 'left' as const,
    },
    {
      field: 'date',
      title: $t('content.message.notify.table.columns.created_date'),
      width: 170,
      align: 'center' as const,
    },
  ],
  pagerConfig: {
    pageSize: 15,
    pageSizes: [10, 15, 20, 50],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        const params: any = {
          page: page.currentPage,
          limit: page.pageSize,
        };
        if (currentTab.value === 'unread') {
          params.status = 'unread';
        }
        if (activeCategory.value !== 0) {
          params.category_id = activeCategory.value;
        }
        if (searchKeyword.value.trim()) {
          params.keyword = searchKeyword.value.trim();
        }
        const resp = await NotifyService.getList(params);
        // 归一化数据：补全 date/isRead/link/query 字段供表格使用
        const items = (resp.list ?? []).map((item: any) => ({
          ...item,
          date: item.created_at
            ? new Date(item.created_at).toLocaleString('zh-CN', {
                hour12: false,
              })
            : '',
          isRead: item.status === 'read',
          link: item.action_url ?? '',
          query: parseActionParams(item.action_params),
          category_name: item.category_name || '通知',
        }));
        return { items, total: resp.total ?? 0 };
      },
    },
  },
  rowConfig: {
    useKey: true,
    keyField: 'id',
  },
};

const gridEvents = {
  'checkbox-change': ({ records }: { records: any[] }) => {
    selectedRecords.value = records ?? [];
    selectedCount.value = selectedRecords.value.length;
  },
  'checkbox-all': ({ records }: { records: any[] }) => {
    selectedRecords.value = records ?? [];
    selectedCount.value = selectedRecords.value.length;
  },
};

const [Grid, gridApi] = useVbenVxeGrid<any>({
  gridOptions,
  gridEvents: gridEvents as any,
});

// ==================== 事件 ====================
/** 安全解析 action_params（JSON 字符串 / 对象） */
function parseActionParams(raw: any): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/** 标记已读（更新徽标 + 本地状态） */
function markItemRead(item: any) {
  if (item.isRead) return;
  notifyStore.markRead(item.id);
  item.isRead = true;
}

/**
 * 标题点击：跳转到消息对应模块
 * - 有导航目标且当前用户菜单中存在 → 跳转（并标记已读）
 * - 有导航目标但菜单中不存在 → 无响应（静默模式）
 * - 无导航目标 → 默认打开文本阅读
 */
function handleTitleClick(item: any) {
  const target: string = item.link || '';
  if (target && canAccessRoute(target)) {
    markItemRead(item);
    if (isExternalLink(target)) {
      window.open(target, '_blank');
      return;
    }
    // 与详情"前往处理"一致：跳转成功后通知父级关闭抽屉
    if (navigateToTarget(target, item.query)) {
      emit('navigate');
    }
    return;
  }
  if (!target) {
    openDetail(item);
  }
}

/** 文本阅读：打开阅读面板（阅读即标记已读） */
function openDetail(item: any) {
  detailWasUnread.value = !item.isRead;
  detailItem.value = item;
  markItemRead(item);
}

function closeDetail() {
  detailItem.value = null;
  // 已读状态变更后刷新列表，保持未读标记/列表数据一致
  if (detailWasUnread.value) {
    detailWasUnread.value = false;
    refresh();
  }
}

/** 阅读面板中的"前往处理"按钮 */
const detailCanNavigate = computed(() => {
  const target: string = detailItem.value?.link || '';
  return !!target && canAccessRoute(target);
});

function goDetailTarget() {
  const item = detailItem.value;
  const target: string = item?.link || '';
  if (!target) return;
  if (isExternalLink(target)) {
    window.open(target, '_blank');
    return;
  }
  if (navigateToTarget(target, item?.query)) {
    closeDetail();
    emit('navigate');
  }
}

function selectCategory(id: number | string) {
  activeCategory.value = activeCategory.value === id ? 0 : id;
  gridApi.query();
}

function onMobileCategoryChange(event: Event) {
  const val = (event.target as HTMLSelectElement).value;
  activeCategory.value = val === '0' ? 0 : val;
  gridApi.query();
}

function refresh() {
  gridApi.query();
}

function clearSelection() {
  selectedRecords.value = [];
  selectedCount.value = 0;
  try {
    gridApi.grid?.clearCheckboxRow();
  } catch {
    // ignore
  }
}

async function handleBatchRead() {
  const ids = selectedRecords.value.map((r: any) => r.id);
  if (ids.length === 0) return;
  await notifyStore.batchMarkRead(ids);
  clearSelection();
  refresh();
}

async function handleMarkAllRead() {
  activeCategory.value = 0;
  setActiveTab('unread');
  await notifyStore.markAllRead();
  refresh();
}

async function handleBatchRemove() {
  const ids = selectedRecords.value.map((r: any) => r.id);
  if (ids.length === 0) return;
  await notifyStore.batchDelete(ids);
  clearSelection();
  refresh();
}

function openSubscribe() {
  router.push({ path: '/content/message/subscribe' });
}

// 切换标签时重置分类到"全部类型"
watch(currentTab, () => {
  activeCategory.value = 0;
});

// 分类变化（用户手动点击或标签切换重置）→ 刷新数据
watch([currentTab, activeCategory], () => {
  refresh();
});

watch(searchKeyword, () => {
  refresh();
});
</script>

<template>
  <div class="flex h-full overflow-hidden rounded-lg bg-card">
    <!-- 左侧分类栏（桌面显示，移动端隐藏） -->
    <div
      class="hidden lg:flex shrink-0 flex-col border-r border-border/30 select-none"
      :style="{ width: `${sidebarWidth}px` }"
    >
      <div class="flex-1 overflow-y-auto py-2">
        <div
          v-for="cat in displayCategories"
          :key="cat.id || 'all'"
          class="mx-2 mb-1 cursor-pointer rounded-md px-3 py-2 text-sm"
          :class="
            activeCategory === cat.id
              ? 'bg-blue-50 text-primary'
              : 'text-muted-foreground hover:bg-accent'
          "
          @click="selectCategory(cat.id)"
        >
          <div class="flex items-center justify-between">
            <span class="truncate">
              {{
                cat.id === 0
                  ? $t('content.message.notify.sidebar.all_types')
                  : cat.name
              }}
            </span>
            <span
              v-if="cat.unreadCount > 0"
              class="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white"
            >
              {{ cat.unreadCount > 99 ? '99+' : cat.unreadCount }}
            </span>
          </div>
        </div>
      </div>
      <div class="border-t border-border/30 px-3 py-2">
        <button
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
          @click="openSubscribe"
        >
          <Settings class="size-3.5" />
          <span>{{
            $t('content.message.notify.sidebar.subscribe_settings')
          }}</span>
        </button>
      </div>
    </div>

    <!-- 可拖拽分隔条（桌面显示，移动端隐藏） -->
    <div
      class="hidden lg:block w-[5px] cursor-col-resize shrink-0 relative group"
      @mousedown="onResizeStart"
    >
      <div
        class="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-border/40 transition-colors group-hover:bg-primary/60"
      ></div>
    </div>

    <!-- 右侧消息列表 -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- 插槽：父级传入标签栏（Drawer 模式） -->
      <slot name="tabs">
        <!-- 页面模式下的内置标签栏 -->
        <div
          v-if="activeTab === undefined"
          class="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border/30 bg-muted/20"
        >
          <button
            class="relative text-sm font-medium transition-colors"
            :class="
              currentTab === 'unread'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="setActiveTab('unread')"
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
            class="relative text-sm font-medium transition-colors"
            :class="
              currentTab === 'all'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="setActiveTab('all')"
          >
            {{ $t('content.message.notify.tabs.all') }}
          </button>
        </div>
      </slot>
      <!-- 搜索栏 -->
      <div class="shrink-0 border-b border-border/30 px-4 py-3">
        <div class="flex items-center gap-2">
          <!-- 移动端分类下拉（桌面隐藏） -->
          <select
            class="h-9 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-primary lg:hidden"
            @change="onMobileCategoryChange"
          >
            <option
              v-for="cat in displayCategories"
              :key="cat.id"
              :value="cat.id"
            >
              {{
                cat.id === 0
                  ? $t('content.message.notify.sidebar.all_types')
                  : cat.name
              }}{{ cat.unreadCount > 0 ? ` (${cat.unreadCount})` : '' }}
            </option>
          </select>

          <div class="relative flex-1 max-w-80">
            <Search
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              v-model="searchKeyword"
              type="text"
              :placeholder="
                $t('content.message.notify.table.search.placeholder')
              "
              class="h-9 w-full rounded-md border border-border bg-background pl-9 pr-4 text-sm outline-none focus:border-primary"
              @keyup.enter="refresh"
            />
          </div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div
        class="shrink-0 flex items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-2"
      >
        <button
          class="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="selectedCount === 0"
          @click="handleBatchRead"
        >
          {{ $t('content.message.notify.table.action.mark_read') }}
        </button>
        <button
          class="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="selectedCount === 0"
          @click="handleBatchRemove"
        >
          <span class="flex items-center gap-1">
            <Trash2 class="size-3" />
            {{ $t('content.message.notify.table.action.batch_delete') }}
          </span>
        </button>
        <button
          class="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
          @click="handleMarkAllRead"
        >
          {{ $t('content.message.notify.table.action.mark_all_read') }}
        </button>
        <span class="ml-auto text-xs text-muted-foreground">
          {{
            $t('content.message.notify.table.pagination.selected', {
              count: selectedCount,
            })
          }}
        </span>
      </div>

      <!-- 主区域：文本阅读面板 / 消息列表 -->
      <div v-if="detailItem" class="flex flex-1 flex-col overflow-hidden">
        <div
          class="shrink-0 flex items-center border-b border-border/30 px-4 py-2.5"
        >
          <button
            class="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
            @click="closeDetail"
          >
            <ChevronLeft class="size-4" />
            {{ $t('content.message.notify.detail.back') }}
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <h3 class="text-base font-medium text-foreground">
            {{ detailItem.title }}
          </h3>
          <div
            class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
          >
            <span v-if="detailItem.category_name">
              {{ $t('content.message.notify.table.columns.type') }}：
              {{ detailItem.category_name }}
            </span>
            <span v-if="detailItem.date">
              {{ $t('content.message.notify.table.columns.created_date') }}：
              {{ detailItem.date }}
            </span>
            <span v-if="detailItem.sender?.real_name">
              {{ $t('content.message.notify.detail.sender') }}：
              {{ detailItem.sender.real_name }}
            </span>
          </div>
          <div
            class="mt-5 whitespace-pre-wrap text-sm leading-6 text-foreground/90"
          >
            {{ detailItem.content || $t('content.message.notify.detail.empty') }}
          </div>
        </div>
        <div
          v-if="detailCanNavigate"
          class="shrink-0 border-t border-border/30 px-6 py-3"
        >
          <button
            class="rounded-md bg-primary px-4 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary/90"
            @click="goDetailTarget"
          >
            {{ $t('content.message.notify.detail.goto') }}
          </button>
        </div>
      </div>
      <div v-else class="flex-1 overflow-hidden">
        <Grid>
          <template #view="{ row }">
            <button
              class="inline-flex items-center justify-center rounded p-1 text-muted-foreground/70 transition-colors hover:bg-accent hover:text-primary"
              :title="$t('content.message.notify.detail.view_tooltip')"
              @click.stop="openDetail(row)"
            >
              <Mail class="size-4" />
            </button>
          </template>
          <template #title="{ row }">
            <span
              class="cursor-pointer transition-colors hover:text-primary"
              :class="{ 'font-medium text-foreground': !row.isRead }"
              :title="row.title"
              @click.stop="handleTitleClick(row)"
            >
              <span
                v-if="!row.isRead"
                class="mr-1 inline-block size-[6px] rounded-full bg-blue-500 align-middle"
              ></span>
              {{ row.title }}
            </span>
          </template>
          <template #content="{ row }">
            <span
              class="cursor-pointer truncate block hover:text-primary"
              :title="row.content"
              @click.stop="openDetail(row)"
            >
              {{ row.content }}
            </span>
          </template>
        </Grid>
      </div>
    </div>
  </div>
</template>
