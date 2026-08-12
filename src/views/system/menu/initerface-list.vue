<script setup lang="ts">
import type { HttpMethod, RouteRow } from '#/api/system/rule';
import type { CrudApiInstance } from '#/components/crud/types';

import { nextTick, ref } from 'vue';

import {
  ElButton,
  ElCard,
  ElCol,
  ElEmpty,
  ElInput,
  ElMessage,
  ElRow,
  ElTag,
  ElTree,
} from 'element-plus';

import { MenuService } from '#/api/system/menu';
import { RuleService } from '#/api/system/rule';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

const emit = defineEmits<{ success: [] }>();

function methodTagType(
  method?: string,
): 'danger' | 'info' | 'primary' | 'success' | 'warning' {
  const map: Record<
    string,
    'danger' | 'info' | 'primary' | 'success' | 'warning'
  > = {
    get: 'success',
    post: 'primary',
    put: 'warning',
    patch: 'warning',
    delete: 'danger',
  };
  return map[method?.toLowerCase() || ''] || 'info';
}

const record = ref<Record<string, any>>({});
const crudApi = ref<CrudApiInstance>();
const keyword = ref('');
const treeData = ref<any[]>([]);
const defaultSelectedKeys = ref<(number | string)[]>([]);
const selectedRoute = ref<Pick<RouteRow, 'method' | 'path'>[]>([]);
const routeList = ref<RouteRow[]>([]);

async function getTree() {
  selectedRoute.value = [];
  const result = await RuleService.cate();
  treeData.value = result || [];
  const first = treeData.value[0];
  if (first) {
    defaultSelectedKeys.value = [first.id];
    await loadData(first.id, null);
  }
}

async function loadData(cateId: any, name: any) {
  const result = await RuleService.list({ cate_id: cateId, keyword: name });
  routeList.value = result || [];
}

function handleSearch() {
  defaultSelectedKeys.value = [];
  loadData(null, keyword.value);
}

function handleRefreshCache() {
  dialogApi.setState({ loading: true, confirmLoading: true });
  RuleService.sync({})
    .then(() => {
      getTree();
      ElMessage.success($t('common.message.success'));
    })
    .finally(() => {
      dialogApi.setState({ loading: false, confirmLoading: false });
    });
}

function handleNodeClick(data: any) {
  defaultSelectedKeys.value = [data?.id];
  loadData(data?.id, null);
}

function normalizeMethod(m: string): HttpMethod {
  const v = m.toLowerCase() as HttpMethod;
  if (!['delete', 'get', 'patch', 'post', 'put'].includes(v))
    throw new Error(`非标准HTTP方法: ${m}`);
  return v;
}

function isSelected(item: RouteRow): boolean {
  return selectedRoute.value.some(
    (s) =>
      s.path === item.path &&
      normalizeMethod(s.method) === normalizeMethod(item.method),
  );
}

interface SelectedRoute extends Pick<RouteRow, 'code' | 'method' | 'path'> {
  methods: string;
  title: string;
  type: number;
}

function handleCardClick(item: RouteRow) {
  const norm = normalizeMethod(item.method);
  const target: SelectedRoute = {
    path: item.path,
    method: item.method,
    methods: item.method,
    title: item.name,
    type: 4,
    code: item.code,
  };
  const idx = selectedRoute.value.findIndex(
    (s) => s.path === target.path && normalizeMethod(s.method) === norm,
  );
  idx === -1
    ? selectedRoute.value.push(target)
    : selectedRoute.value.splice(idx, 1);
}

const [Dialog, dialogApi] = useDialog({
  title: $t('system.menu.api.title'),
  width: '75%',
  dialogType: 'drawer',
  draggable: true,
  destroyOnClose: true,
  onConfirm() {
    if (selectedRoute.value.length === 0) return;
    dialogApi.setState({ loading: true, confirmLoading: true });
    const data = selectedRoute.value.map((r: any) => ({
      ...r,
      pid: record.value.id,
    }));
    MenuService.batchStore({ menus: data })
      .then(() => {
        ElMessage.success($t('common.message.success'));
        crudApi.value?.refreshCreate();
        emit('success');
        dialogApi.close();
      })
      .finally(() =>
        dialogApi.setState({ loading: false, confirmLoading: false }),
      );
  },
});

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudApiInstance }) {
    record.value = data;
    crudApi.value = getCrudApi();
    dialogApi.open();
    // 等 Dialog 渲染完毕后再加载数据
    nextTick().then(() => getTree());
  },
});
</script>

<template>
  <Dialog>
    <div class="interface-list">
      <!-- 提示 -->
      <p>{{ $t('system.menu.api.tips.1') }}</p>
      <p>{{ $t('system.menu.api.tips.2') }}</p>
      <p>{{ $t('system.menu.api.tips.3') }}</p>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <ElInput
          v-model="keyword"
          :placeholder="$t('system.menu.api.search')"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <ElButton type="primary" @click="handleSearch">
          {{ $t('system.menu.api.search') }}
        </ElButton>
        <ElButton @click="handleRefreshCache">
          {{ $t('system.menu.api.refresh_cache') }}
        </ElButton>
      </div>

      <!-- 左右布局 -->
      <div class="main-body">
        <!-- 左侧分类树 -->
        <div class="tree-panel">
          <ElTree
            node-key="id"
            :data="treeData"
            :props="{ label: 'label', children: 'children' }"
            :current-node-key="defaultSelectedKeys[0]"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>

        <!-- 右侧卡片 -->
        <div class="card-panel">
          <template v-if="routeList.length === 0">
            <ElEmpty :description="$t('system.menu.api.title')" />
          </template>
          <ElRow v-else :gutter="12">
            <ElCol v-for="(item, index) in routeList" :key="index" :span="12">
              <ElCard
                shadow="hover"
                class="route-card"
                :class="[{ selected: isSelected(item) }]"
                @click="handleCardClick(item)"
              >
                <div class="card-head">
                  <ElTag
                    :type="methodTagType(item.method)"
                    size="small"
                    disable-transitions
                  >
                    {{ item.method?.toUpperCase() }}
                  </ElTag>
                  <span class="card-name" :title="item.name">{{
                    item.name
                  }}</span>
                </div>
                <div class="card-body">
                  <div class="route-item">
                    <span class="label"
                      >{{ $t('system.menu.api.route_info.path') }}：</span
                    >
                    <code class="val">{{ item.path }}</code>
                  </div>
                  <div v-if="item.code" class="route-item">
                    <span class="label"
                      >{{ $t('system.menu.api.route_info.code') }}：</span
                    >
                    <span class="val">{{ item.code }}</span>
                  </div>
                </div>
              </ElCard>
            </ElCol>
          </ElRow>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
.interface-list {
  padding: 20px;

  .tips-sub {
    padding: 1px 0;
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
}

.search-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 12px 0;

  .search-input {
    width: 220px;
  }
}

// 左右布局 —— 不设固定高度，内容自然撑开
.main-body {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  // 左侧树
  .tree-panel {
    flex-shrink: 0;
    width: 220px;
    padding: 6px 0;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
  }

  // 右侧卡片（overflow hidden 裁剪 ElRow gutter 负边距）
  .card-panel {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
}

// 卡片
.route-card {
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition: all 0.2s;

  :deep(.el-card__body) {
    padding: 10px 14px;
  }

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px var(--el-box-shadow-lighter);
  }

  &.selected {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }

  .card-head {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;

    .el-tag {
      flex-shrink: 0;
      min-width: 50px;
      font-family: monospace;
      font-weight: 600;
      text-align: center;
    }

    .card-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
    }
  }

  .card-body {
    .route-item {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 1px 0;
      font-size: 12px;
      line-height: 1.6;

      .label {
        flex-shrink: 0;
        color: var(--el-text-color-secondary);
      }

      .val {
        flex: 1;
        padding: 0 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: monospace;
        color: var(--el-text-color-regular);
        white-space: nowrap;
        background: var(--el-fill-color-light);
        border-radius: 3px;
      }
    }
  }
}
</style>
