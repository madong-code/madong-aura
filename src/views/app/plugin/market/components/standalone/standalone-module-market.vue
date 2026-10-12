<script setup lang="ts">
/** 单体版模块市场 - 对接后端 adminapi 接口 */
import { onMounted, ref } from 'vue';

import { ElMessage, ElMessageBox } from 'element-plus';

import { AppPluginMarketService } from '#/api/app/plugin/market';
import { requestClient } from '#/api/request';
import { $t } from '#/locales';

import ModuleDetail from './module-detail.vue';
import ModuleList from './module-list.vue';
import TableHeader from './table-header.vue';

defineOptions({ name: 'StandaloneModuleMarket' });

// ── 状态管理 ────────────────────────────
const searchKeyword = ref('');
const activeTab = ref('all');
const currentViewMode = ref<'card' | 'table'>('card');
const loading = ref(false);
/** 全量数据（一次拉取） */
const allModules = ref<any[]>([]);
/** 当前 Tab 过滤后的数据 */
const modulesData = ref<any[]>([]);
const totalCount = ref(0);

// 模块详情
const moduleDetailRef = ref();
const selectedModuleForDetail = ref<any>(null);

// ── API 请求 ────────────────────────────
const buildApiParams = () => {
  const params: Record<string, any> = { page: 1, limit: 100 };
  if (searchKeyword.value) params.keyword = searchKeyword.value;
  return params;
};

/** 分类在前端过滤：切 Tab 不请求、无 loading 遮罩，体验与「我的应用」一致 */
const filterByTab = (items: any[], tab: string) => {
  switch (tab) {
    case 'installed': {
      return items.filter((m) => !!m.is_installed);
    }
    case 'un_installed': {
      return items.filter((m) => !m.is_installed);
    }
    case 'purchased': {
      return items.filter((m) => !!m.purchased || !!m.is_authorized);
    }
    case 'updatable': {
      return items.filter((m) => !!m.has_update);
    }
    default: {
      return items;
    }
  }
};

const applyFilter = () => {
  modulesData.value = filterByTab(allModules.value, activeTab.value);
  totalCount.value = modulesData.value.length;
};

const fetchModules = async () => {
  loading.value = true;
  try {
    const response = await AppPluginMarketService.getList(buildApiParams());
    // 后端返回 { items: ModuleRow[], total: number, page, limit }
    allModules.value = (response as any)?.items || [];
    applyFilter();
  } finally {
    loading.value = false;
  }
};

// ── 模块详情 ────────────────────────────
const showModuleDetail = async (module: any) => {
  try {
    const key = module.code || module.key;
    const response = await AppPluginMarketService.getDetail(key);
    const moduleData = { ...module, ...(response as any) };
    selectedModuleForDetail.value = moduleData;
    moduleDetailRef.value?.openDialog(moduleData);
  } catch {
    selectedModuleForDetail.value = module;
    moduleDetailRef.value?.openDialog(module);
  }
};

// ── 事件处理 ────────────────────────────
const handleSearch = async (keyword: string) => {
  searchKeyword.value = keyword;
  await fetchModules();
};

/** 切 Tab 走本地过滤，不发请求 → 无白屏闪烁 */
const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  applyFilter();
};

const handleViewChange = (mode: 'card' | 'table') => {
  currentViewMode.value = mode;
};

const handleRefresh = async () => {
  await fetchModules();
};

// 下载模块：GET /plugin/{key}/download
const handleDownload = async (module: any) => {
  try {
    const key = module.code || module.key;
    await requestClient.get(`/plugin/${key}/download`);
    ElMessage.success(
      $t('app.plugin.market.standalone.download.start', { name: module.name }),
    );
    await fetchModules();
  } catch {
    ElMessage.error($t('app.plugin.market.standalone.download.fail'));
  }
};

// 删除模块：DELETE /plugin/{key}
const handleDelete = async (module: any) => {
  try {
    const key = module.code || module.key;
    await ElMessageBox.confirm(
      $t('app.plugin.market.standalone.delete.confirm_msg', {
        name: module.name,
      }),
      $t('app.plugin.market.standalone.delete.confirm_title'),
      {
        confirmButtonText: $t('app.plugin.market.standalone.delete.confirm'),
        cancelButtonText: $t('app.plugin.market.standalone.delete.cancel'),
        type: 'warning',
      },
    );
    await requestClient.delete(`/plugin/${key}`);
    ElMessage.success(
      $t('app.plugin.market.standalone.delete.success', { name: module.name }),
    );
    await fetchModules();
  } catch {
    // 用户取消
  }
};

// 卸载模块
const handleUninstall = async (module: any) => {
  await fetchModules();
  ElMessage.success(
    $t('app.plugin.market.standalone.uninstall.success', { name: module.name }),
  );
};

// 首次进入主动拉一次全量（骨架屏占位，不用 v-loading 白色遮罩）
onMounted(fetchModules);
</script>

<template>
  <div class="module-container flex flex-col min-h-0">
    <TableHeader
      :total-count="totalCount"
      :loading="loading"
      @search="handleSearch"
      @tab-change="handleTabChange"
      @view-change="handleViewChange"
      @refresh="handleRefresh"
    />
    <ModuleList
      class="flex-1 min-h-0"
      :modules="modulesData"
      :view-mode="currentViewMode"
      :loading="loading"
      @view-detail="showModuleDetail"
      @download="handleDownload"
      @uninstall="handleUninstall"
      @delete="handleDelete"
      @refresh="handleRefresh"
    />

    <ModuleDetail
      ref="moduleDetailRef"
      :module-id="selectedModuleForDetail?.id"
      @close="selectedModuleForDetail = null"
      @download="handleDownload"
      @refresh="handleRefresh"
    />
  </div>
</template>
