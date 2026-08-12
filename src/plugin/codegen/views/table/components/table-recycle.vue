<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { nextTick, ref } from 'vue';

import { ElButton, ElDrawer, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { GeneratorTableService } from '#/api/app/plugin/codegen/table';
import { $t } from '#/locales';

interface RecycleRow {
  id: string;
  original_id: string;
  data: Record<string, any> | string;
  table_name: string;
  enabled: number;
  ip: string;
  operate_name?: string;
  created_date?: string;
}

defineOptions({ name: 'CodegenTableRecycle' });

const emit = defineEmits<{ success: [] }>();

const visible = ref(false);
const selectedKeys = ref<string[]>([]);

const gridOptions: VxeTableGridOptions<RecycleRow> = {
  height: 'auto',
  rowConfig: { keyField: 'id' },
  checkboxConfig: { highlight: true },
  pagerConfig: {},
  columns: [
    { type: 'checkbox', width: 48 },
    { type: 'seq', width: 55, title: '#' },
    {
      field: 'original_id',
      title: $t('codegen.table.table.recycle.original_id'),
      minWidth: 150,
      formatter: ({ cellValue }) => cellValue ?? '--',
    },
    {
      field: 'table_name',
      title: $t('codegen.table.table.recycle.table_name'),
      width: 140,
      formatter: ({ cellValue }) => cellValue ?? '--',
    },
    {
      field: 'data',
      title: $t('codegen.table.table.recycle.data'),
      minWidth: 220,
      formatter: ({ cellValue }: any) => {
        if (!cellValue) return '--';
        try {
          const obj =
            typeof cellValue === 'string' ? JSON.parse(cellValue) : cellValue;
          return obj.table_content ?? obj.table_name ?? JSON.stringify(obj);
        } catch {
          return cellValue;
        }
      },
    },
    {
      field: 'operate_name',
      title: $t('codegen.table.table.recycle.operator'),
      width: 120,
      formatter: ({ cellValue }) => cellValue ?? '--',
    },
    {
      field: 'created_date',
      title: $t('codegen.table.table.recycle.created_date'),
      width: 150,
      formatter: 'formatDateTime',
    },
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page }: any) => {
        const res = await GeneratorTableService.recycleList({
          page: page.currentPage,
          limit: page.pageSize,
        });
        return {
          items: res.items ?? [],
          total: res.total ?? 0,
        };
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid<RecycleRow>({ gridOptions });

function getCheckedRows() {
  const g = gridApi.grid as any;
  return g && typeof g.getCheckboxRecords === 'function'
    ? (g.getCheckboxRecords() as RecycleRow[])
    : [];
}

function onCheckboxChange() {
  selectedKeys.value = getCheckedRows().map((r) => r.id);
}

function show() {
  selectedKeys.value = [];
  visible.value = true;
  nextTick(() => gridApi.reload());
}

/** 批量恢复 */
async function handleRestore() {
  const ids = selectedKeys.value;
  if (ids.length === 0) {
    ElMessage.warning($t('codegen.table.table.recycle.select_first'));
    return;
  }
  await ElMessageBox.confirm(
    $t('codegen.table.table.recycle.restore_confirm', [ids.length]),
    $t('codegen.table.table.recycle.restore'),
    { type: 'warning' },
  );
  try {
    await GeneratorTableService.recycleRestore(ids);
    ElMessage.success($t('codegen.table.table.recycle.restore_success'));
    gridApi.reload();
    emit('success');
  } catch (error: any) {
    ElMessage.error(error?.message || $t('common.error'));
  }
}

/** 批量删除 */
async function handleDelete() {
  const ids = selectedKeys.value;
  if (ids.length === 0) {
    ElMessage.warning($t('codegen.table.table.recycle.select_first'));
    return;
  }
  await ElMessageBox.confirm(
    $t('codegen.table.table.recycle.delete_confirm', [ids.length]),
    $t('codegen.table.table.recycle.delete'),
    { type: 'warning' },
  );
  try {
    await GeneratorTableService.recycleDelete(ids);
    ElMessage.success($t('codegen.table.table.recycle.delete_success'));
    gridApi.reload();
    emit('success');
  } catch (error: any) {
    ElMessage.error(error?.message || $t('common.error'));
  }
}

defineExpose({ show });
</script>

<template>
  <ElDrawer
    v-model="visible"
    :title="$t('codegen.table.table.recycle.title')"
    size="78%"
    direction="rtl"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="m-drawer-body">
      <div class="mb-2 flex items-center gap-2">
        <ElButton
          type="primary"
          :disabled="selectedKeys.length === 0"
          @click="handleRestore"
        >
          {{ $t('codegen.table.table.recycle.restore') }}
        </ElButton>
        <ElButton
          type="danger"
          :disabled="selectedKeys.length === 0"
          @click="handleDelete"
        >
          {{ $t('codegen.table.table.recycle.delete') }}
        </ElButton>
      </div>
      <Grid
        @checkbox-change="onCheckboxChange"
        @checkbox-all="onCheckboxChange"
      />
    </div>
  </ElDrawer>
</template>

<style scoped>
.m-drawer-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  overflow-y: auto;
}
</style>
