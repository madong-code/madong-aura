<script setup lang="ts">
/** 模块列表：卡片/表格视图 + 分页 + 操作弹窗 */
import { computed, nextTick, ref, watch } from 'vue';

import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElIcon,
  ElPagination,
  ElTag,
} from 'element-plus';
import { Info, Key, Package } from 'lucide-vue-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { Icon } from '#/components/icon';
import { $t } from '#/locales';

import ModuleInstallDialog from './module-install-dialog.vue';
import ModuleUninstallDialog from './module-uninstall-dialog.vue';
import UpgradeLog from './upgrade-log.vue';

defineOptions({ name: 'ModuleList' });

const props = defineProps<{
  loading?: boolean;
  modules: any[];
  viewMode: 'card' | 'table';
}>();
const emit = defineEmits<{
  delete: [module: any];
  download: [module: any];
  refresh: [];
  uninstall: [module: any];
  viewDetail: [module: any];
}>();

// ── 分页 ──────────────────────────────────
const currentPage = ref(1);
const pageSize = ref(12);
const total = computed(() => props.modules.length);
const currentPageModules = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return props.modules.slice(start, start + pageSize.value);
});

// 数据变化（搜索 / 切 Tab）后若当前页越界则回到第一页，避免列表空白
watch(
  () => props.modules,
  () => {
    const maxPage = Math.max(
      1,
      Math.ceil(props.modules.length / pageSize.value),
    );
    if (currentPage.value > maxPage) {
      currentPage.value = 1;
    }
  },
);

// ── vxe-grid 配置（表格模式，使用内置分页）──
const tableGridOptions = computed<any>(() => ({
  data: props.modules,
  columns: [
    { type: 'seq', title: $t('app.plugin.market.column_seq'), width: 60, align: 'center' },
    {
      field: 'name',
      title: $t('app.plugin.market.column_module'),
      minWidth: 200,
      slots: { default: 'name' },
    },
    { field: 'version', title: $t('app.plugin.market.column_version'), width: 100, align: 'center' },
    {
      field: 'is_installed',
      title: $t('app.plugin.market.column_status'),
      width: 100,
      align: 'center',
      slots: { default: 'status' },
    },
    {
      title: $t('app.plugin.market.column_action'),
      width: 160,
      align: 'center',
      fixed: 'right',
      slots: { default: 'action' },
    },
  ],
  border: 'none',
  stripe: true,
  size: 'small',
  height: '100%',
  showOverflow: 'tooltip',
  pagerConfig: {
    enabled: true,
    pageSize: pageSize.value,
    pageSizes: [12, 24, 48, 96],
  },
}));

const [VxeGrid] = useVbenVxeGrid<any>({
  gridOptions: {} as any,
});

// ── Dialog refs ─────────────────────────────
const installDialogRef = ref();
const selectedModuleForInstall = ref<any>(null);
const uninstallDialogRef = ref();
const selectedModuleForUninstall = ref<any>(null);
const upgradeLogRef = ref();
const selectedModuleForUpgrade = ref<any>(null);

// ── 操作 ────────────────────────────────────
const downloadModule = async (mod: any) => {
  selectedModuleForInstall.value = mod;
  await nextTick();
  installDialogRef.value?.openDialog();
};

const uninstallModule = async (mod: any) => {
  selectedModuleForUninstall.value = mod;
  await nextTick();
  uninstallDialogRef.value?.openDialog();
};

const deleteModule = (mod: any) => {
  emit('delete', mod);
};

const showUpdateLog = (mod: any) => {
  selectedModuleForUpgrade.value = mod;
  upgradeLogRef.value?.openDialog(mod);
};

/** 表格「更多」下拉命令：与 CRUD TableAction 行为对齐 */
const handleMore = (mod: any, cmd: string) => {
  switch (cmd) {
    case 'delete': {
      deleteModule(mod);
      break;
    }
    case 'install':
    case 'download':
    case 'update': {
      downloadModule(mod);
      break;
    }
    case 'log': {
      showUpdateLog(mod);
      break;
    }
    case 'uninstall': {
      uninstallModule(mod);
      break;
    }
  }
};

// ── 分页回调 ────────────────────────────────
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};
</script>

<template>
  <div class="module-list-container">
    <!-- 首次加载骨架屏：占位高度，避免 loading 白遮罩 + 内容区塌陷抖动 -->
    <div
      v-if="loading && currentPageModules.length === 0"
      class="skeleton-grid"
    >
      <div v-for="i in 8" :key="i" class="skeleton-card">
        <div class="skeleton-card-header">
          <div class="skeleton-logo skeleton-block"></div>
          <div class="skeleton-text">
            <div class="skeleton-block skeleton-line"></div>
            <div class="skeleton-block skeleton-line is-short"></div>
          </div>
        </div>
        <div class="skeleton-card-body">
          <div class="skeleton-block skeleton-tag"></div>
        </div>
        <div class="skeleton-card-footer">
          <div class="skeleton-block skeleton-btn"></div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="currentPageModules.length === 0" class="empty-state">
      <div class="empty-icon">
        <ElIcon :size="48" class="text-gray-300 dark:text-gray-600">
          <Package />
        </ElIcon>
      </div>
      <div class="empty-text">
        <h3 class="text-lg font-medium mb-2">
          {{ $t('app.plugin.market.empty_title') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ $t('app.plugin.market.empty_desc') }}
        </p>
      </div>
    </div>

    <!-- 卡片视图模式 -->
    <div v-else-if="viewMode === 'card'" class="card-view">
      <div class="card-grid">
        <div
          v-for="mod in currentPageModules"
          :key="mod.code || mod.id"
          class="module-card"
        >
          <!-- 顶部：Logo和基本信息 -->
          <div class="card-header">
            <div class="card-info-row">
              <div class="card-logo-wrap">
                <div class="card-logo-inner">
                  <img
                    v-if="mod.icon || mod.cover"
                    :src="mod.icon || mod.cover"
                    alt=""
                    class="w-full h-full object-contain"
                  />
                  <span v-else class="text-blue-600 dark:text-blue-400 text-xl">📦</span>
                </div>
              </div>
              <div class="card-info-text">
                <h3 class="card-title" :title="mod.name">{{ mod.name }}</h3>
                <div class="card-code">
                  <ElIcon :size="12"><Key /></ElIcon>
                  <span>{{ mod.code || mod.key }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 中间：版本和更新日志 -->
          <div class="card-body">
            <div class="card-meta">
              <ElTag
                size="small"
                effect="plain"
                class="version-tag"
                @click.stop="showUpdateLog(mod)"
              >
                {{
                  $t('app.plugin.market.version', {
                    ver: mod.version || '1.0.0',
                  })
                }}
              </ElTag>
              <ElButton
                type="text"
                size="small"
                @click.stop="showUpdateLog(mod)"
              >
                <ElIcon :size="14"><Info /></ElIcon>{{ $t('app.plugin.market.update_log') }}
              </ElButton>
            </div>
          </div>

          <!-- 底部：操作按钮 -->
          <div class="card-footer">
            <div class="action-row">
              <!-- 已安装 → 卸载 -->
              <ElButton
                v-if="mod.is_installed"
                type="danger"
                size="small"
                class="flex-1"
                @click.stop="uninstallModule(mod)"
              >
                {{ $t('app.plugin.market.standalone.uninstall.immediate') }}
              </ElButton>
              <!-- 已购买未安装 → 下载 -->
              <ElButton
                v-else-if="mod.purchased && !mod.is_installed"
                type="primary"
                size="small"
                class="flex-1"
                @click.stop="downloadModule(mod)"
              >
                {{ $t('app.plugin.market.standalone.download.immediate') }}
              </ElButton>
              <!-- 已购买有更新 → 更新 -->
              <ElButton
                v-else-if="mod.purchased && mod.has_update"
                type="warning"
                size="small"
                class="flex-1"
                @click.stop="downloadModule(mod)"
              >
                {{ $t('app.plugin.market.standalone.update.immediate') }}
              </ElButton>
              <!-- 未安装 → 安装 + 删除 -->
              <template v-else-if="!mod.is_installed">
                <ElButton
                  type="primary"
                  size="small"
                  class="flex-1"
                  @click.stop="downloadModule(mod)"
                >
                  {{ $t('app.plugin.market.standalone.install.immediate') }}
                </ElButton>
                <ElButton
                  type="danger"
                  size="small"
                  class="flex-1"
                  @click.stop="deleteModule(mod)"
                >
                  {{ $t('app.plugin.market.standalone.delete.immediate') }}
                </ElButton>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- vxe-grid 表格视图模式 -->
    <VxeGrid
      v-else
      :grid-options="tableGridOptions"
      class="vxe-grid-wrapper pb-5"
      grid-class="!p-0"
    >
      <template #name="{ row }">
        <div class="flex items-center gap-3">
          <div class="table-logo">
            <img
              v-if="row.icon || row.cover"
              :src="row.icon || row.cover"
              alt=""
              class="w-full h-full object-contain"
            />
            <span v-else class="text-blue-600 dark:text-blue-400 text-base">📦</span>
          </div>
          <div>
            <div class="text-sm font-medium">{{ row.name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ row.code || row.key }}
            </div>
          </div>
        </div>
      </template>
      <template #status="{ row }">
        <ElTag
          :type="row.is_installed ? 'success' : 'info'"
          size="small"
          effect="plain"
        >
          {{
            row.is_installed
              ? $t('app.plugin.market.installed_tag')
              : $t('app.plugin.market.uninstalled_tag')
          }}
        </ElTag>
      </template>
      <template #action="{ row }">
        <div class="table-actions">
          <!-- 固定列：更新信息 (每行都有, 置于首位保证纵向对齐) -->
          <ElButton type="primary" link size="small" @click.stop="showUpdateLog(row)">
            {{ $t('app.plugin.market.update_info') }}
          </ElButton>

          <!-- 更多下拉：与 CRUD TableAction 一致 (ant-design:bars-outlined) -->
          <ElDropdown
            trigger="hover"
            @command="(cmd: string) => handleMore(row, cmd)"
          >
            <ElButton type="primary" link size="small">
              {{ $t('app.plugin.market.more') }}
              <template #icon>
                <Icon icon="ant-design:bars-outlined" />
              </template>
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem v-if="row.is_installed" command="uninstall">
                  {{ $t('app.plugin.market.standalone.uninstall.immediate') }}
                </ElDropdownItem>
                <ElDropdownItem
                  v-else-if="row.purchased && row.has_update"
                  command="update"
                >
                  {{ $t('app.plugin.market.standalone.update.immediate') }}
                </ElDropdownItem>
                <ElDropdownItem v-else-if="row.purchased" command="download">
                  {{ $t('app.plugin.market.standalone.download.immediate') }}
                </ElDropdownItem>
                <ElDropdownItem v-else command="install">
                  {{ $t('app.plugin.market.standalone.install.immediate') }}
                </ElDropdownItem>
                <ElDropdownItem
                  v-if="!row.purchased"
                  command="delete"
                  divided
                >
                  {{ $t('app.plugin.market.standalone.delete.immediate') }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>
      </template>
    </VxeGrid>

    <!-- 分页 - 卡片模式下常驻右下角 -->
    <div v-if="viewMode === 'card' && total > 0" class="pagination-footer">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 48, 96]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 安装弹窗 -->
    <ModuleInstallDialog
      ref="installDialogRef"
      :plugin="selectedModuleForInstall"
      @close="selectedModuleForInstall = null"
      @refresh="emit('refresh')"
    />
    <!-- 卸载弹窗 -->
    <ModuleUninstallDialog
      ref="uninstallDialogRef"
      :plugin="selectedModuleForUninstall"
      @close="selectedModuleForUninstall = null"
      @refresh="emit('uninstall', selectedModuleForUninstall)"
    />
    <!-- 升级日志弹窗 -->
    <UpgradeLog ref="upgradeLogRef" @close="selectedModuleForUpgrade = null" />
  </div>
</template>

<style scoped>
/* ── 整体容器 ───────────────────────────── */
.module-list-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

/* ── 空状态 ──────────────────────────────── */
.empty-state {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
}

/* ── 卡片网格 ───────────────────────────── */
.card-view {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.card-grid {
  display: grid;
  /* 固定每行 4 张卡片, 与平台端「我的应用」保持一致 */
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.module-card {
  position: relative;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.module-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 12px rgb(79 140 255 / 12%);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.card-info-row {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.card-logo-wrap {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-9) 0%,
    var(--el-color-primary-light-8) 100%
  );
  color: var(--el-color-primary);
  border-radius: 8px;
}

.card-logo-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  overflow: hidden;
  border-radius: 4px;
}

.card-info-text {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.card-code {
  display: flex;
  gap: 4px;
  align-items: center;
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.card-body {
  padding: 8px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.version-tag {
  color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary-light-7) !important;
}

.card-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.action-row {
  display: flex;
  gap: 8px;
}

/* ── vxe-grid 表格 ──────────────────────── */
.table-logo {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  overflow: hidden;
  background: var(--el-fill-color);
  border-radius: 6px;
}

.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  white-space: nowrap;
}

.vxe-grid-wrapper {
  flex: 1;
  height: 100%;
  min-height: 0;
}

/* 明亮主题：给 vxe-grid 表头追加浅色背景，与内容行区分（暗黑主题保持原样） */
html:not(.dark) .vxe-grid-wrapper :deep(.vxe-table--header-wrapper),
html:not(.dark) .vxe-grid-wrapper :deep(.vxe-table--header),
html:not(.dark) .vxe-grid-wrapper :deep(.vxe-header--column) {
  background-color: var(--el-color-primary-light-9, #ecf5ff) !important;
}

/* ── 分页 ──────────────────────────────── */
.pagination-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0 0;
  margin-top: auto;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* ── 骨架屏（首次加载占位）────────────── */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.skeleton-card {
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.skeleton-card-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
}
.skeleton-logo {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 8px;
}
.skeleton-text {
  flex: 1;
  min-width: 0;
}
.skeleton-line {
  height: 14px;
  margin-bottom: 8px;
}
.skeleton-line.is-short {
  width: 45%;
  margin-bottom: 0;
}
.skeleton-card-body {
  padding: 8px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.skeleton-tag {
  width: 84px;
  height: 22px;
  border-radius: 4px;
}
.skeleton-card-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.skeleton-btn {
  height: 32px;
  border-radius: 4px;
}
.skeleton-block {
  background: linear-gradient(
    90deg,
    var(--el-fill-color) 25%,
    var(--el-fill-color-light) 37%,
    var(--el-fill-color) 63%
  );
  background-size: 400% 100%;
  border-radius: 4px;
  animation: skeleton-loading 1.4s ease infinite;
}
@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton-block {
    animation: none;
  }
}

/* ── 响应式 ──────────────────────────────── */
@media (max-width: 1280px) {
  .card-grid,
  .skeleton-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .card-grid,
  .skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .card-grid,
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
}
</style>
