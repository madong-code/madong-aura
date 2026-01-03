<template>
  <div class="table-header-container mb-6">
    <!-- 第一行：搜索框和视图切换 -->
    <div class="header-row-1 mb-4">
      <ElRow justify="space-between" align="middle" :gutter="16">
        <ElCol :lg="12" :md="12" :sm="14" :xs="16">
          <ElInput
            v-model="searchKeyword"
            :prefix-icon="Search"
            clearable
            placeholder="搜索模块名称、描述..."
            @keyup.enter="handleSearch"
            @clear="handleSearch"
            size="large"
            class="search-input"
          >
          </ElInput>
        </ElCol>
        <ElCol :lg="12" :md="12" :sm="10" :xs="8">
          <div class="flex items-center justify-end space-x-3">
            <!-- 视图模式切换 -->
            <el-radio-group v-model="viewMode" size="small" class="view-mode-switch">
              <el-radio-button label="card">
                <art-svg-icon icon="ri:layout-grid-line" class="mr-1" size="14" />
                卡片视图
              </el-radio-button>
              <el-radio-button label="table">
                <art-svg-icon icon="ri:table-line" class="mr-1" size="14" />
                表格视图
              </el-radio-button>
            </el-radio-group>

            <!-- 操作按钮 -->
            <el-button type="primary" size="small" class="action-btn">
              <art-svg-icon icon="ri:refresh-line" class="mr-1" size="14" />
              刷新
            </el-button>
          </div>
        </ElCol>
      </ElRow>
    </div>

    <!-- 第二行：标签页切换 -->
    <div class="header-row-2">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <el-tabs
            v-model="activeTab"
            @tab-click="handleTabClick"
            size="default"
            class="category-tabs"
          >
            <el-tab-pane
              v-for="category in categories"
              :key="category.key"
              :label="category.label"
              :name="category.key"
            />
          </el-tabs>
        </div>
        <div class="ml-4 text-sm text-gray-500 whitespace-nowrap">
          共 {{ totalCount }} 个模块
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Search } from "@element-plus/icons-vue";
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";
import { moduleCategories } from "./../store";

const emit = defineEmits(["search", "tab-change", "view-change", "refresh"]);

// Props
const props = defineProps<{
  totalCount?: number;
}>();

// 搜索关键词
const searchKeyword = ref("");

// 视图模式：card-卡片视图，table-表格视图
const viewMode = ref<"card" | "table">("card");

// 标签页
const categories = moduleCategories;
const activeTab = ref(categories[0]?.key || "all");

// 搜索处理
const handleSearch = () => {
  emit("search", searchKeyword.value);
};

// 标签页切换
const handleTabClick = (tab: any) => {
  emit("tab-change", tab.props.name);
};

// 视图模式切换
watch(viewMode, (newMode) => {
  emit("view-change", newMode);
});

// 组件挂载后触发默认事件
onMounted(() => {
  emit("tab-change", activeTab.value);
  emit("view-change", viewMode.value);
});

// 监听categories变化
watch(
  categories,
  (newCategories) => {
    if (newCategories.length > 0 && activeTab.value !== newCategories[0].key) {
      activeTab.value = newCategories[0].key;
    }
  },
  { deep: true }
);
</script>

<style scoped>
.table-header-container {
  background: white;
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-row-1 {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.header-row-2 {
  padding-top: 8px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.view-mode-switch {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 2px;
}

.view-mode-switch :deep(.el-radio-button__inner) {
  border: none;
  border-radius: 4px;
  background: transparent;
}

.view-mode-switch :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.category-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.category-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.category-tabs :deep(.el-tabs__item) {
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
}

.action-btn {
  border-radius: 6px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .table-header-container {
    padding: 16px;
  }

  .header-row-1 {
    flex-direction: column;
    gap: 12px;
  }

  .view-mode-switch {
    width: 100%;
    justify-content: center;
  }
}
</style>
