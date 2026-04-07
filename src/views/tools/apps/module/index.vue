<template>
  <div class="module-container">
    <TableHeader
      :total-count="totalCount"
      :loading="loading"
      @search="handleSearch"
      @tab-change="handleTabChange"
      @view-change="handleViewChange"
      @refresh="handleRefresh"
    />
    <ModuleList
      :modules="modulesData"
      :view-mode="currentViewMode"
      @view-detail="showModuleDetail"
      @download="handleDownload"
      @uninstall="handleUninstall"
      @delete="handleDelete"
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

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { TableHeader, ModuleList, ModuleDetail } from "./components";
import AppsService from "@/api/tools/apps/module";

// 状态管理
const searchKeyword = ref("");
const activeTab = ref("all");
const currentViewMode = ref<"card" | "table">("card");
const loading = ref(false);
const modulesData = ref<any[]>([]);
const totalCount = ref(0);

// 模块详情相关
const moduleDetailRef = ref();
const selectedModuleForDetail = ref<any>(null);

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

  // 分页参数
  params.current = 1;
  params.size = 100; // 获取足够多的数据，避免分页问题

  return params;
};

// 获取模块列表数据
const fetchModules = async () => {
  loading.value = true;
  try {
    const params = buildApiParams();
    const response = await AppsService.getModuleList(params);
    const modules = response?.items || [];
    modulesData.value = modules;
    totalCount.value = response.total || modules.length;
  } finally {
    loading.value = false;
  }
};

// 显示模块详情
const showModuleDetail = async (module: any) => {
  try {
    const response = await AppsService.getModuleDetail(module.name);
    const moduleData = { ...module, ...response };
    selectedModuleForDetail.value = moduleData;
    moduleDetailRef.value?.openDialog(moduleData);
  } catch (error) {
    console.error("获取模块详情失败:", error);
    selectedModuleForDetail.value = module;
    moduleDetailRef.value?.openDialog(module);
  }
};

// 事件处理
const handleSearch = async (keyword: string) => {
  searchKeyword.value = keyword;
  await fetchModules();
};

const handleTabChange = async (tab: string) => {
  activeTab.value = tab;
  await fetchModules();
};

const handleViewChange = (mode: "card" | "table") => {
  currentViewMode.value = mode;
};

const handleRefresh = async () => {
  await fetchModules();
};

// 下载模块
const handleDownload = async (module: any) => {
  try {
    const response = await AppsService.download({
      name: module.name,
      version: module.version,
    });

    if (response.success) {
      ElMessage.success(`开始下载模块: ${module.name}`);
      await fetchModules(); // 刷新列表
    } else {
      ElMessage.error(response.message || "下载失败");
    }
  } catch (error) {
    ElMessage.error("下载模块失败");
  }
};

// 删除模块
const handleDelete = async (module: any) => {
  try {
    await (ElMessageBox as any).confirm(
      `删除插件会把插件目录连同文件全部删除，确定要删除 ${module.name} 吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "danger",
      }
    );

    await AppsService.delete(module.name);
    ElMessage.success(`模块 ${module.name} 删除成功`);
    await fetchModules();
  } catch (error) {
    // 用户取消删除
  }
};

// 卸载模块
const handleUninstall = async (module: any) => {
  // 卸载完成后刷新列表
  await fetchModules();
  ElMessage.success(`模块 ${module.name} 卸载成功`);
};

onMounted(() => {
  fetchModules();
});
</script>
