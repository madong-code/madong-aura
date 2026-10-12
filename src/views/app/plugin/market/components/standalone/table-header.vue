<script setup lang="ts">
/** 模块市场顶部栏：搜索 / Tab 分类 / 视图切换 */
import { onMounted, ref, watch } from 'vue';

import {
  ElCol,
  ElIcon,
  ElInput,
  ElRadioButton,
  ElRadioGroup,
  ElRow,
  ElTabPane,
  ElTabs,
} from 'element-plus';
import { LayoutGrid, List, Search } from 'lucide-vue-next';

import { $t } from '#/locales';

import { getCategoryIcon, moduleCategories } from './store';

defineOptions({ name: 'TableHeader' });

const _props = defineProps<{ loading?: boolean; totalCount?: number }>();
const emit = defineEmits<{
  refresh: [];
  search: [keyword: string];
  tabChange: [tab: string];
  viewChange: [mode: 'card' | 'table'];
}>();
const searchKeyword = ref('');
const viewMode = ref<'card' | 'table'>('card');
const categories = moduleCategories;
const activeTab = ref('all');

const handleSearch = () => {
  emit('search', searchKeyword.value);
};
const handleTabClick = (tab: any) => {
  activeTab.value = tab.props.name;
  emit('tabChange', tab.props.name);
};

watch(viewMode, (newMode) => {
  emit('viewChange', newMode);
});

onMounted(() => {
  emit('tabChange', activeTab.value);
  emit('viewChange', viewMode.value);
});
</script>

<template>
  <ElRow :gutter="20" align="middle" class="mb-4">
    <ElCol :xs="16" :sm="16" :md="12" :lg="12">
      <ElInput
        v-model="searchKeyword"
        :placeholder="$t('app.plugin.market.search_placeholder')"
        clearable
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>
    </ElCol>
    <ElCol :xs="8" :sm="8" :md="12" :lg="12" class="button-group">
      <div style="display: flex; gap: 10px; justify-content: flex-end">
        <ElRadioGroup v-model="viewMode" size="default" class="view-mode-switch">
          <ElRadioButton label="card">
            <ElIcon style="margin-right: 4px; vertical-align: middle">
              <LayoutGrid />
            </ElIcon>
            {{ $t('app.plugin.market.card_view') }}
          </ElRadioButton>
          <ElRadioButton label="table">
            <ElIcon style="margin-right: 4px; vertical-align: middle">
              <List />
            </ElIcon>
            {{ $t('app.plugin.market.table_view') }}
          </ElRadioButton>
        </ElRadioGroup>
        <div class="ml-4 text-sm text-gray-500 whitespace-nowrap">
          {{ $t('app.plugin.market.total_count', { count: totalCount || 0 }) }}
        </div>
      </div>
    </ElCol>
  </ElRow>
  <ElRow :gutter="20" align="middle">
    <ElCol :xs="24" :sm="24" :md="24" :lg="24" class="button-group">
      <ElTabs
        v-model="activeTab"
        @tab-click="handleTabClick"
        size="default"
        class="category-tabs"
      >
        <ElTabPane
          v-for="category in categories"
          :key="category.key"
          :name="category.key"
        >
          <template #label>
            <span class="tab-label">
              <ElIcon><component :is="getCategoryIcon(category.key)" /></ElIcon>
              {{ $t(`app.plugin.market.categories.${category.key}`) }}
            </span>
          </template>
        </ElTabPane>
      </ElTabs>
    </ElCol>
  </ElRow>
</template>

<style scoped>
.category-tabs {
  margin-bottom: 8px;
}
.category-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}
.view-mode-switch :deep(.el-radio-button__inner) {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}
</style>
