<script setup lang="ts">
/** 单体版模块市场 - 对接后端 adminapi 接口 */
import { ref } from 'vue';

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
const modulesData = ref<any[]>([]);
const totalCount = ref(0);

// 模块详情
const moduleDetailRef = ref();
const selectedModuleForDetail = ref<any>(null);

// ── API 请求 ────────────────────────────
const buildApiParams = () => {
  const params: Record<string, any> = { page: 1, limit: 100 };
  if (searchKeyword.value) params.keyword = searchKeyword.value;
  if (activeTab.value !== 'all') params.type = activeTab.value;
  return params;
};

const fetchModules = async () => {
  loading.value = true;
  try {
    const params = buildApiParams();
    const response = await AppPluginMarketService.getList(params);
    // 后端返回 { items: ModuleRow[], total: number, page, limit }
    modulesData.value = (response as any)?.items || [];
    totalCount.value = (response as any)?.total || modulesData.value.length;
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

const handleTabChange = async (tab: string) => {
  activeTab.value = tab;
  await fetchModules();
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

// onMounted 由子组件 table-header 挂载时 emit('tabChange') 触发 fetchModules
</script>

<template>
  <div
    class="module-container px-5 py-5 flex flex-col min-h-0"
    v-loading="loading"
  >
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
