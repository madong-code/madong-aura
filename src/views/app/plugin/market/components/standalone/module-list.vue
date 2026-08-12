<script setup lang="ts">
/** 模块列表：卡片/表格视图 + 分页 + 操作弹窗 */
import { computed, nextTick, ref } from 'vue';

import { ElButton, ElIcon, ElPagination, ElTag } from 'element-plus';
import { Info, Key, Package } from 'lucide-vue-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';

import ModuleInstallDialog from './module-install-dialog.vue';
import ModuleUninstallDialog from './module-uninstall-dialog.vue';
import UpgradeLog from './upgrade-log.vue';

defineOptions({ name: 'ModuleList' });

const props = defineProps<{ modules: any[]; viewMode: 'card' | 'table' }>();
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

// ── vxe-grid 配置（表格模式，使用内置分页）──
const tableGridOptions = computed<any>(() => ({
  data: props.modules,
  columns: [
    { type: 'seq', title: '#', width: 60, align: 'center' },
    {
      field: 'name',
      title: '模块信息',
      minWidth: 200,
      slots: { default: 'name' },
    },
    { field: 'version', title: '版本', width: 100, align: 'center' },
    {
      field: 'is_installed',
      title: '状态',
      width: 100,
      align: 'center',
      slots: { default: 'status' },
    },
    {
      title: '操作',
      minWidth: 280,
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
    <!-- 空状态 -->
    <div v-if="currentPageModules.length === 0" class="empty-state">
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
    <div v-else-if="viewMode === 'card'" class="card-view pb-5">
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
                  <span v-else class="text-blue-600 dark:text-blue-400 text-xl"
                    >📦</span
                  >
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
                <ElIcon :size="14"><Info /></ElIcon
                >{{ $t('app.plugin.market.update_log') }}
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
            <span v-else class="text-blue-600 dark:text-blue-400 text-base"
              >📦</span
            >
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
          <ElButton
            v-if="row.is_installed"
            type="danger"
            size="small"
            @click.stop="uninstallModule(row)"
          >
            {{ $t('app.plugin.market.standalone.uninstall.immediate') }}
          </ElButton>
          <template v-else>
            <ElButton
              v-if="row.purchased"
              type="primary"
              size="small"
              @click.stop="downloadModule(row)"
            >
              {{
                row.has_update
                  ? $t('app.plugin.market.standalone.update.immediate')
                  : $t('app.plugin.market.standalone.download.immediate')
              }}
            </ElButton>
            <ElButton
              v-else
              type="primary"
              size="small"
              @click.stop="downloadModule(row)"
            >
              {{ $t('app.plugin.market.standalone.install.immediate') }}
            </ElButton>
            <ElButton
              v-if="!row.purchased"
              type="danger"
              size="small"
              @click.stop="deleteModule(row)"
            >
              {{ $t('app.plugin.market.standalone.delete.immediate') }}
            </ElButton>
          </template>
          <ElButton type="text" size="small" @click.stop="showUpdateLog(row)">
            {{ $t('app.plugin.market.update_info') }}
          </ElButton>
        </div>
      </template>
    </VxeGrid>

    <!-- 分页 - 仅卡片模式且数据超过一页时显示 -->
    <div
      v-if="viewMode === 'card' && total > pageSize"
      class="pagination-footer"
    >
      <div class="pagination-container">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
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
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.module-card {
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition: all 0.25s;
}

.module-card:hover {
  border-color: var(--el-border-color-hover);
  box-shadow: var(--el-box-shadow-light);
  transform: translateY(-2px);
}

.card-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.card-info-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.card-logo-wrap {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-9) 0%,
    var(--el-color-primary-light-8) 100%
  );
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 8px;
}

.card-logo-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 4px;
}

.card-info-text {
  flex: 1;
  min-width: 0;
}

.card-title {
  margin-bottom: 6px;
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
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
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
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.vxe-grid-wrapper {
  flex: 1;
  height: 100%;
  min-height: 0;
}

/* ── 分页 ──────────────────────────────── */
.pagination-footer {
  flex-shrink: 0;
  padding: 12px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

.pagination-container {
  display: flex;
  justify-content: center;
}

/* ── 响应式 ──────────────────────────────── */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .pagination-footer {
    padding: 12px 0;
  }
}
</style>
