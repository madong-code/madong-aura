<template>
  <el-row :gutter="20" align="middle" class="mb-4">
    <el-col :xs="16" :sm="16" :md="12" :lg="12">
      <el-input
        v-model="searchKeyword"
        :placeholder="$t('tools.features.search_placeholder')"
        clearable
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <el-icon><search /></el-icon>
        </template>
      </el-input>
    </el-col>
    <el-col :xs="8" :sm="8" :md="12" :lg="12" class="button-group">
      <div style="display: flex; justify-content: flex-end; gap: 10px">
        <el-radio-group v-model="viewMode" size="small" class="view-mode-switch">
          <el-radio-button label="card">
            <art-svg-icon icon="ri:layout-grid-line" class="mr-1" size="14" />
            {{ $t("tools.features.card_view") }}
          </el-radio-button>
          <el-radio-button label="table">
            <art-svg-icon icon="ri:table-line" class="mr-1" size="14" />
            {{ $t("tools.features.table_view") }}
          </el-radio-button>
        </el-radio-group>
        <div class="ml-4 text-sm text-gray-500 whitespace-nowrap">
          {{ $t("tools.features.total_modules", { count: props.totalCount || 0 }) }}
        </div>
      </div>
    </el-col>
  </el-row>
  <el-row :gutter="20" align="middle">
    <el-col :xs="24" :sm="24" :md="24" :lg="24" class="button-group">
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
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";
import { moduleCategories } from "../store";

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
const activeTab = ref("all"); // 默认选择"全部"分类

// 搜索处理
const handleSearch = () => {
  emit("search", searchKeyword.value);
};

// 标签页切换
const handleTabClick = (tab: any) => {
  activeTab.value = tab.props.name; // 更新当前激活的tab
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
</script>
