<template>
  <Dialog>
    <div class="load-table-content art-full-height">
      <BasicCrud @reset="handleReset" />
    </div>
  </Dialog>
</template>
<script setup lang="tsx">
import { useDialog } from "@/components/dialog";
import { CrudMethods, useCrud } from "@/components/crud";
import { GeneratorCodeService } from "@/app/api/tools/code";
import { $t } from "@/locales";

// Emits定义：向父组件发送选中表数据事件
const emit = defineEmits<{
  (event: "table-selected", tableData: any): void;
  (event: "update:table-name", tableName: string): void;
}>();

const parentCrudApi = ref<CrudMethods>();
const [Dialog, dialogApi] = useDialog({
  title: $t("tools.code.import_table.title"),
  width: "60%",
  dialogType: "drawer",
  draggable: true,
  closeOnClickModal: true,
  destroyOnClose: true,
  modal: true,
  onConfirm: async () => {
    const selection = crudApi.getRowSelection();
    if (selection.length === 0) {
      ElMessage.warning($t("tools.code.import_table.no_selection"));
      return;
    }

    await GeneratorCodeService.create({ table: selection });
    ElMessage.success($t("common.message.success"));

    // 关闭对话框
    dialogApi.close();
  },
});
const [BasicCrud, crudApi] = useCrud({
  api: GeneratorCodeService.getTableList,
  rowKey: "name",
  beforeFetch(params: any) {
    // 请求参数处理
    return {
      ...params,
    };
  },
  useCrud: false,
  searchFormSchema: {
    schema: [
      {
        prop: "name",
        label: $t("tools.code.import_table.table_name"),
        component: "Input",
        componentProps: {
          placeholder: $t("tools.code.import_table.search_placeholder"),
        },
        colSpan: 8,
      },
    ],
  },
  columns: [
    {
      type: "selection",
    },
    {
      prop: "name",
      label: $t("tools.code.import_table.table_name"),
    },
    {
      prop: "comment",
      label: $t("tools.code.import_table.table_comment"),
    },
    {
      prop: "engine",
      label: $t("tools.code.import_table.engine"),
    },
    {
      prop: "collation",
      label: $t("tools.code.import_table.charset"),
    },
    {
      prop: "created_date",
      label: $t("tools.code.import_table.create_time"),
    },
  ],
});
const handleCheck = () => {
  crudApi.reload();
};
const handleReset = () => {
  crudApi.reload();
};
defineExpose({
  show() {
    dialogApi.open();
  },
});
</script>
<style lang="scss" scoped>
.load-table-content {
  flex-grow: 1;
  min-width: 0;
  height: 100%;
}

.art-table-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
