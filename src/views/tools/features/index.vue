<template>
  <div class="features-container">
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
      @update-log="showUpgradeLog"
    />
    <UpgradeLog
      ref="upgradeLogRef"
      :module-id="selectedModuleForUpgrade?.id"
      :module-name="selectedModuleForUpgrade?.name"
      @close="selectedModuleForUpgrade = null"
    />

    <ModuleDetail
      ref="moduleDetailRef"
      :module-id="selectedModuleForDetail?.id"
      @close="selectedModuleForDetail = null"
      @download="handleDownload"
      @uninstall="handleUninstall"
    />
  </div>
</template>

<script setup lang="ts">
import { TableHeader, ModuleList, UpgradeLog, ModuleDetail } from "./components";
import FeaturesService from "@/api/tools/features";

// 状态管理
const searchKeyword = ref("");
const activeTab = ref("all");
const currentViewMode = ref<"card" | "table">("card");
const detailVisible = ref(false);
const selectedModule = ref(null);
const loading = ref(false);
const modulesData = ref<any[]>([]);
const totalCount = ref(0);

// 升级日志相关
const upgradeLogRef = ref();
const selectedModuleForUpgrade = ref<any>(null);

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
    const response = await FeaturesService.getFeaturesList(params);
    const features = response?.items || [];
    modulesData.value = features;
    totalCount.value = response.total || features.length;
  } finally {
    loading.value = false;
  }
};

// 显示模块详情
const showModuleDetail = async (module: any) => {
  try {
    const response = await FeaturesService.getFeaturesDetail(module.name);
    selectedModuleForDetail.value = { ...module, ...response };
    moduleDetailRef.value?.openDialog();
  } catch (error) {
    console.error("获取模块详情失败:", error);
    selectedModuleForDetail.value = module;
    moduleDetailRef.value?.openDialog();
  }
};

// 显示更新记录
const showUpgradeLog = async (module: any) => {
  try {
    const response = await FeaturesService.getFeaturesUpgradeLogs(module.name);
    selectedModuleForUpgrade.value = { ...module, upgradeLogs: response };
    upgradeLogRef.value?.openDialog();
  } catch (error) {
    console.error("获取更新记录失败:", error);
    selectedModuleForUpgrade.value = module;
    upgradeLogRef.value?.openDialog();
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
    const response = await FeaturesService.downloadFeatures({
      name: module.name,
      version: module.version,
    });

    if (response.success) {
      ElMessage.success(`开始下载模块: ${module.name}`);
      // 这里可以添加实际的下载逻辑
    } else {
      ElMessage.error(response.message || "下载失败");
    }
  } catch (error) {
    ElMessage.error("下载模块失败");
  }
};

// 卸载模块
const handleUninstall = async (module: any) => {
  try {
    const response = await FeaturesService.uninstallFeatures({
      name: module.name,
    });

    if (response.success) {
      ElMessage.success(`模块 ${module.name} 卸载成功`);
      await fetchModules(); // 刷新列表
    } else {
      ElMessage.error(response.message || "卸载失败");
    }
  } catch (error) {
    ElMessage.error("卸载模块失败");
  }
};

onMounted(() => {
  fetchModules();
});
</script>
