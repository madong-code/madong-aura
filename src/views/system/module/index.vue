<template>
  <div class="bg-gray-50 min-h-screen">
    <TableHeader @search="handleSearch" />
    <Tabs @tab-change="handleTabChange" />
    <ModuleList :modules="filteredModules" @view-detail="handleViewDetail" />
    <ModuleDetail v-model:visible="detailVisible" :module="selectedModule" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import { moduleCategories, moduleList } from "./store";
import { Tabs, TableHeader, ModuleList, ModuleDetail } from "./components";

// 状态管理
const searchKeyword = ref("");
const activeTab = ref("all");
const detailVisible = ref(false);
const selectedModule = ref(null);

// 过滤模块列表
const filteredModules = computed(() => {
  return moduleList.filter((module) => {
    const matchesSearch =
      module.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      module.description.toLowerCase().includes(searchKeyword.value.toLowerCase());
    const matchesTab = activeTab.value === "all" || module.category === activeTab.value;
    return matchesSearch && matchesTab;
  });
});

// 事件处理
const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword;
};

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
};

const handleViewDetail = (module: any) => {
  selectedModule.value = module;
  detailVisible.value = true;
};

onMounted(() => {
  // 初始化数据
  console.log("模块市场页面加载");
});
</script>
