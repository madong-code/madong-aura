<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { ElMessage } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { GeneratorCodeService } from '#/api/app/plugin/codegen';
import { GeneratorTableService } from '#/api/app/plugin/codegen/table';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

defineOptions({ name: 'ImportTable' });

const emit = defineEmits<{
  success: [];
  tableSelected: [tableData: any];
  'update:table-name': [tableName: string];
}>();

const [Dialog, dialogApi] = useDialog({
  title: $t('codegen.generate.import_table.title'),
  dialogType: 'drawer',
  direction: 'rtl',
  width: '60%',
  draggable: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  onConfirm: async () => {
    const selection = crudApi.getRowSelection();
    if (selection.length === 0) {
      ElMessage.warning($t('codegen.generate.import_table.no_selection'));
      return;
    }
    await GeneratorCodeService.create({ table: selection });
    ElMessage.success($t('common.success'));
    dialogApi.close();
    emit('success');
  },
});

const containerRef = ref<HTMLElement | null>(null);
let resizeObserver: null | ResizeObserver = null;

function updateHeight() {
  if (!containerRef.value) return;
  const h = Math.max(200, Math.floor(containerRef.value.clientHeight) - 110);
  crudApi.setGridOptions({ height: h });
}

onMounted(() => {
  const observer = new ResizeObserver(() => updateHeight());
  if (containerRef.value) {
    observer.observe(containerRef.value);
  }
  resizeObserver = observer;
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

const [BasicCrud, crudApi] = useCrud({
  crudApi: { list: (params) => GeneratorTableService.getTableList(params) },
  rowKey: 'name',
  hasAdd: false,
  hasEdit: false,
  hasRemove: false,
  hasView: false,
  columns: [
    { type: 'checkbox', width: 60 },
    {
      field: 'name',
      title: $t('codegen.generate.import_table.table_name'),
      minWidth: 150,
      align: 'left',
    },
    {
      field: 'engine',
      title: $t('codegen.generate.import_table.engine'),
      width: 100,
      align: 'left',
    },
    {
      field: 'collation',
      title: $t('codegen.generate.import_table.charset'),
      width: 170,
    },
    {
      field: 'comment',
      title: $t('codegen.generate.import_table.table_comment'),
      minWidth: 200,
      align: 'left',
    },
    {
      field: 'created_date',
      title: $t('codegen.generate.import_table.create_time'),
      width: 150,
      formatter: 'formatDateTime',
    },
  ],
  searchForm: {
    enabled: true,
    collapsed: true,
    schema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: $t('codegen.generate.import_table.table_name'),
        componentProps: {
          placeholder: $t('codegen.generate.import_table.search_placeholder'),
          clearable: true,
        },
      },
    ],
  },
  formDialog: { enabled: false, schema: [] },
});

defineExpose({
  show() {
    dialogApi.open();
  },
});
</script>

<template>
  <Dialog>
    <div ref="containerRef" class="import-table-content">
      <BasicCrud />
    </div>
  </Dialog>
</template>

<style scoped>
.import-table-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
</style>
