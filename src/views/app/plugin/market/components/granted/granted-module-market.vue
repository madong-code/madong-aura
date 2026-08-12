<script setup lang="ts">
/** 授权版模块市场 - 对接已授权插件接口，仅安装/卸载菜单，更新数据库 */
import { ref } from 'vue';

import { requestClient } from '#/api/request';

import GrantedModuleDetail from './granted-module-detail.vue';
import GrantedModuleList from './granted-module-list.vue';
import GrantedTableHeader from './table-header.vue';

defineOptions({ name: 'GrantedModuleMarket' });

// ── 状态管理 ────────────────────────────
const searchKeyword = ref('');
const activeTab = ref('all');
const currentViewMode = ref<'card' | 'table'>('card');
const loading = ref(false);
const modulesData = ref<any[]>([]);
const totalCount = ref(0);

// 模块详情
const selectedModuleForDetail = ref<any>(null);

// ── API 请求（租户已授权插件列表）────────
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
    const response: any = await requestClient.get('/tenant/plugin', { params });
    modulesData.value = response?.items || [];
    totalCount.value = response?.total || modulesData.value.length;
  } finally {
    loading.value = false;
  }
};

// ── 事件处理（无删除）────────────────────
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

// 安装菜单：由子弹窗内部处理 POST /tenant/plugin/{code}/install-menu
const handleInstall = async () => {
  await fetchModules();
};

// 卸载菜单：由子弹窗内部处理 POST /tenant/plugin/{code}/uninstall-menu
const handleUninstall = async () => {
  await fetchModules();
};

// 更新数据库：由子组件处理 POST /tenant/plugin/{code}/update-db
const handleUpdateDb = async () => {
  await fetchModules();
};

// onMounted 由子组件 table-header 挂载时 emit('tabChange') 触发 fetchModules
</script>

<template>
  <div
    class="module-container px-5 py-5 flex flex-col min-h-0"
    v-loading="loading"
  >
    <GrantedTableHeader
      :total-count="totalCount"
      :loading="loading"
      @search="handleSearch"
      @tab-change="handleTabChange"
      @view-change="handleViewChange"
      @refresh="handleRefresh"
    />
    <GrantedModuleList
      class="flex-1 min-h-0"
      :modules="modulesData"
      :view-mode="currentViewMode"
      @install="handleInstall"
      @uninstall="handleUninstall"
      @update="handleUpdateDb"
    />

    <GrantedModuleDetail
      :module-id="selectedModuleForDetail?.id"
      @close="selectedModuleForDetail = null"
      @install="handleInstall"
      @uninstall="handleUninstall"
      @update="handleUpdateDb"
      @refresh="handleRefresh"
    />
  </div>
</template>
