<template>
  <div class="page-content min-h-screen">
    <TableHeader
      :total-count="modulesData.length"
      :loading="loading"
      @search="handleSearch"
      @tab-change="handleTabChange"
      @view-change="handleViewChange"
      @refresh="handleRefresh"
    />
    <ModuleList
      :modules="modulesData"
      :view-mode="currentViewMode"
      :loading="loading"
      @view-detail="handleViewDetail"
    />
    <ModuleDetail v-model:visible="detailVisible" :module="selectedModule" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import { moduleCategories } from "./store";
import { TableHeader, ModuleList, ModuleDetail } from "./components";
import ModulesService from "@/app/api/system/module";

// 状态管理
const searchKeyword = ref("");
const activeTab = ref("all");
const currentViewMode = ref<"card" | "table">("card");
const detailVisible = ref(false);
const selectedModule = ref(null);
const loading = ref(false);
const modulesData = ref<any[]>([]);

// 构建API请求参数
const buildApiParams = () => {
  const params: Record<string, any> = {};

  // 搜索关键词参数
  if (searchKeyword.value) {
    params.keyword = searchKeyword.value;
  }

  // 分类标签参数
  if (activeTab.value !== "all") {
    params.category = activeTab.value;
  }

  return params;
};

// 获取模块列表数据
const fetchModules = async () => {
  loading.value = true;
  try {
    const params = buildApiParams();
    const response = (await ModulesService.list(params)) as any;
    modulesData.value = response.items || [];
  } catch (error) {
    modulesData.value = [];
  } finally {
    loading.value = false;
  }
};

// 事件处理
const handleSearch = async (keyword: string) => {
  searchKeyword.value = keyword;
  await fetchModules(); // 搜索时重新请求数据
};

const handleTabChange = async (tab: string) => {
  activeTab.value = tab;
  await fetchModules(); // 切换标签时重新请求数据
};

const handleViewChange = (mode: "card" | "table") => {
  currentViewMode.value = mode;
};

const handleRefresh = async () => {
  await fetchModules();
};

const handleViewDetail = (module: any) => {
  selectedModule.value = module;
  detailVisible.value = true;
};

onMounted(() => {
  console.log("模块市场页面加载");
  fetchModules();
});
</script>
