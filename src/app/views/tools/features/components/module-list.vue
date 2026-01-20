<template>
  <div class="module-list-container">
    <!-- 内容区域 -->
    <div class="content-area" :class="{ 'has-content': currentPageModules.length > 0 }">
      <!-- 空状态 -->
      <div v-if="currentPageModules.length === 0" class="empty-state">
        <div class="empty-icon">
          <art-svg-icon icon="ri:box-3-line" size="48" class="text-gray-300" />
        </div>
        <div class="empty-text">
          <h3 class="text-lg font-medium mb-2">
            {{ $t("tools.features.no_data_title") }}
          </h3>
          <p class="text-gray-500">{{ $t("tools.features.no_data_description") }}</p>
        </div>
      </div>

      <!-- 卡片视图模式 -->
      <div v-else-if="viewMode === 'card'" class="card-view">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <div
            v-for="module in currentPageModules"
            :key="module.id"
            class="group c-p overflow-hidden border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <!-- 顶部：Logo和基本信息 -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-start space-x-3">
                <!-- Logo区域 -->
                <div class="flex-shrink-0">
                  <div
                    class="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200"
                  >
                    <div class="w-10 h-10 overflow-hidden rounded">
                      <img
                        v-if="module.poster"
                        :src="module.poster"
                        alt=""
                        class="w-full h-full object-contain"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <art-svg-icon
                          :icon="getModuleIcon(module.category)"
                          :size="24"
                          class="text-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 标题和标识信息 -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-semibold truncate mb-1" :title="module.name">
                    {{ module.name }}
                  </h3>
                  <div class="space-y-1">
                    <div class="flex items-center text-xs text-gray-500">
                      <art-svg-icon
                        icon="ri:key-line"
                        class="mr-1 text-gray-400"
                        size="12"
                      />
                      <span class="font-mono truncate">{{
                        module.appId || module.code || module.id
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 中间：分类和状态信息 -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex justify-between items-center">
                <el-tag
                  size="small"
                  effect="plain"
                  class="border-blue-200 text-blue-600"
                  @click.stop="showUpdateLog(module)"
                >
                  {{ $t("tools.features.version") }}{{ module.version || "1.0.0" }}
                </el-tag>
                <el-button
                  type="text"
                  size="small"
                  @click.stop="showUpdateLog(module)"
                  class="px-2"
                >
                  <art-svg-icon icon="ri:information-line" class="mr-1" size="14" />
                  {{ $t("tools.features.update_log") }}
                </el-button>
              </div>
            </div>

            <!-- 底部：更新记录和操作按钮 -->
            <div class="p-4">
              <!-- 操作按钮 -->
              <div class="flex space-x-2">
                <el-button
                  v-if="module.installed"
                  type="danger"
                  size="small"
                  class="flex-1"
                  @click.stop="uninstallModule(module)"
                >
                  <art-svg-icon icon="ri:uninstall-line" class="mr-1" size="14" />
                  {{ $t("tools.features.uninstall") }}
                </el-button>
                <el-button
                  v-else
                  type="primary"
                  size="small"
                  class="flex-1"
                  @click.stop="downloadModule(module)"
                >
                  <art-svg-icon icon="ri:download-line" class="mr-1" size="14" />
                  {{ $t("tools.features.download") }}
                </el-button>

                <el-button
                  type="text"
                  size="small"
                  @click.stop="handleViewDetail(module)"
                  class="px-2"
                >
                  <art-svg-icon icon="ri:eye-line" class="mr-1" size="14" />
                  {{ $t("tools.features.view_details") }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 表格视图模式 -->
      <div v-else class="table-view">
        <el-table
          :data="currentPageModules"
          style="width: 100%"
          stripe
          class="module-table"
          :empty-text="$t('tools.features.no_data_title')"
        >
          <el-table-column
            type="index"
            :label="$t('tools.features.table_columns.index')"
            width="90"
            align="center"
          />

          <el-table-column
            :label="$t('tools.features.table_columns.module_info')"
            min-width="200"
          >
            <template #default="{ row }">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded flex items-center justify-center mr-3">
                  <div class="w-full h-full overflow-hidden rounded">
                    <img
                      v-if="row.poster"
                      :src="row.poster"
                      alt=""
                      class="w-full h-full object-contain"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center bg-gray-100"
                    >
                      <art-svg-icon
                        :icon="getModuleIcon(row.category)"
                        :size="20"
                        class="text-blue-600"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div class="font-medium text-sm">{{ row.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ row.appId || row.code || row.id }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="appId"
            :label="$t('tools.features.table_columns.app_id')"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <span class="text-sm font-mono">{{ row.appId || "-" }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="version"
            :label="$t('tools.features.table_columns.version')"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <span class="text-sm">{{ row.version || "1.0.0" }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="installed"
            :label="$t('tools.features.table_columns.status')"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-tag :type="row.installed ? 'success' : 'info'" size="small">
                {{
                  row.installed
                    ? $t("tools.features.status.installed")
                    : $t("tools.features.status.not_installed")
                }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('tools.features.table_columns.actions')"
            width="300"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <div class="flex items-center justify-center space-x-2">
                <el-button
                  v-if="row.installed"
                  type="danger"
                  size="small"
                  @click.stop="uninstallModule(row)"
                >
                  {{ $t("tools.features.uninstall") }}
                </el-button>
                <el-button
                  v-else
                  type="primary"
                  size="small"
                  @click.stop="downloadModule(row)"
                >
                  {{ $t("tools.features.download") }}
                </el-button>

                <el-button type="text" size="small" @click.stop="handleViewDetail(row)">
                  {{ $t("tools.features.view_details") }}
                </el-button>

                <el-button type="text" size="small" @click.stop="showUpdateLog(row)">
                  {{ $t("tools.features.update_info") }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 分页控件 - 始终在底部 -->
    <div class="pagination-footer" v-if="total > 0">
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";
import { moduleCategories } from "../store";

// Props
const props = defineProps<{
  modules: any[];
  viewMode: "card" | "table";
}>();

const emit = defineEmits(["view-detail", "download", "uninstall", "update-log"]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 计算总条数
const total = computed(() => props.modules.length);

// 计算当前页显示的数据
const currentPageModules = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return props.modules.slice(start, end);
});

// 获取模块图标
const getModuleIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    all: "ri:app-store-line",
    "full-app": "ri:app-store-line",
    backend: "ri:settings-3-line",
    infrastructure: "ri:server-line",
    "single-page": "ri:file-text-line",
    other: "ri:more-fill",
  };
  return iconMap[category] || "ri:app-store-line";
};

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const categoryObj = moduleCategories.find((cat) => cat.key === category);
  return categoryObj ? categoryObj.label : category;
};

// 查看详情
const handleViewDetail = (module: any) => {
  emit("view-detail", module);
};

// 下载模块
const downloadModule = (module: any) => {
  emit("download", module);
};

// 卸载模块
const uninstallModule = (module: any) => {
  emit("uninstall", module);
};

// 显示更新记录
const showUpdateLog = (module: any) => {
  emit("update-log", module);
};

// 分页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

// 当前页改变
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};
</script>

<style scoped>
.module-list-container {
  display: flex;
  flex-direction: column;
  min-height: 500px;
  height: 100%;
}

.content-area {
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.content-area.has-content {
  padding-bottom: 20px;
}

/* 空状态样式 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-text h3 {
  margin-bottom: 8px;
}

/* 卡片视图 */
.card-view {
  flex: 1;
}

/* 表格视图 */
.table-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.module-table :deep(.el-table) {
  flex: 1;
}

.module-table :deep(.el-table__body-wrapper) {
  flex: 1;
}

.module-table :deep(.el-table__row) {
  cursor: default;
}

.module-table :deep(.el-table__row:hover) {
  /* background-color: #f5f7fa; */
}

/* 分页底部区域 */
.pagination-footer {
  position: sticky;
  bottom: 0;
  /* background: white; */
  border-top: 1px solid #f0f0f0;
  padding: 16px 0;
  margin-top: auto;
  z-index: 10;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .module-list-container {
    min-height: 400px;
  }

  .pagination-footer {
    padding: 12px 0;
  }

  .pagination-container :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-container :deep(.el-pagination__total) {
    margin-bottom: 8px;
    width: 100%;
    text-align: center;
  }
}

/* 操作按钮样式优化 */
:deep(.el-button--text) {
  padding: 8px 4px;
}

:deep(.el-button--small) {
  padding: 7px 11px;
}

/* 卡片悬停效果优化 */
.group:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
