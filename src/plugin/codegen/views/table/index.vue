<script setup lang="ts">
import { ref } from 'vue';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { GeneratorTableService } from '#/api/app/plugin/codegen/table';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import TableCreate from './components/table-create.vue';
import TableRecycle from './components/table-recycle.vue';
import TableStructure from './components/table-structure.vue';

defineOptions({ name: 'CodegenTable' });

const createRef = ref();
const structureRef = ref();
const recycleRef = ref();

const [TableCrud, crudApi] = useCrud({
  crudApi: {
    list: (params: any) => GeneratorTableService.getTableList(params),
  },
  hasAdd: false,
  hasEdit: false,
  hasView: false,
  hasRemove: false,
  hasBatchRemove: false,
  columns: [
    { field: 'name', title: $t('codegen.table.table.name'), minWidth: 200 },
    {
      field: 'comment',
      title: $t('codegen.table.table.comment'),
      minWidth: 180,
    },
    { field: 'engine', title: $t('codegen.table.table.engine'), width: 120 },
    { field: 'rows', title: $t('codegen.table.table.rows'), width: 110 },
    {
      field: 'data_free',
      title: $t('codegen.table.table.fragment'),
      width: 120,
      formatter: ({ cellValue }: any) => formatSize(cellValue),
    },
    {
      field: 'data_length',
      title: $t('codegen.table.table.data_size'),
      width: 120,
      formatter: ({ cellValue }: any) => formatSize(cellValue),
    },
    {
      field: 'updated_date',
      title: $t('codegen.table.table.updated_at'),
      width: 180,
      formatter: 'formatDateTime',
    },
  ],
  toolbarActions: [
    {
      label: $t('codegen.table.table.create.title'),
      type: 'primary',
      sort: 1010,
      icon: 'ant-design:plus-outlined',
      onClick: () => createRef.value?.show(),
    },
    {
      label: $t('codegen.table.table.optimize'),
      type: 'success',
      sort: 1020,
      icon: 'ant-design:thunderbolt-outlined',
      onClick: () => handleOptimize(),
    },
    {
      label: $t('codegen.table.table.cleanup'),
      type: 'info',
      sort: 1030,
      icon: 'ant-design:delete-outlined',
      onClick: () => handleCleanup(),
    },
  ],
  tableActionColumn: {
    width: 240,
    title: $t('codegen.table.table.action'),
    fixed: 'right',
  },
  tableActions: [
    {
      label: $t('codegen.table.table.structure_action'),
      type: 'primary',
      link: true,
      icon: 'ant-design:profile-outlined',
      onClick: (_e: Event, row: any) => structureRef.value?.show(row.name),
    },
    {
      label: $t('codegen.table.table.recycle_list_action'),
      type: 'warning',
      link: true,
      icon: 'ant-design:inbox-outlined',
      onClick: () => recycleRef.value?.show(),
    },
  ],
});

function formatSize(n: number) {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(2)} ${units[i]}`;
}

async function handleOptimize() {
  await ElMessageBox.confirm(
    $t('codegen.table.table.optimize_confirm'),
    $t('codegen.table.table.optimize'),
    { type: 'warning' },
  );
  const res = await GeneratorTableService.optimize([]);
  showBatchResult(res, $t('codegen.table.table.optimize_success'));
}

async function handleCleanup() {
  await ElMessageBox.confirm(
    $t('codegen.table.table.cleanup_confirm'),
    $t('codegen.table.table.cleanup'),
    { type: 'warning' },
  );
  const res = await GeneratorTableService.cleanup([]);
  showBatchResult(res, $t('codegen.table.table.cleanup_success'));
}

function showBatchResult(res: any, okMsg: string) {
  const data: any[] = res?.data ?? [];
  const failed = data.filter((it: any) => !it.success);
  if (failed.length > 0) {
    ElMessage.warning(
      $t('codegen.table.table.cleanup_result', [
        data.length - failed.length,
        data.length,
      ]),
    );
    return;
  }
  ElMessage.success(okMsg);
}
</script>

<template>
  <Page auto-content-height>
    <TableCrud />
    <TableCreate ref="createRef" @success="crudApi.query()" />
    <TableStructure ref="structureRef" />
    <TableRecycle ref="recycleRef" @success="crudApi.query()" />
  </Page>
</template>
