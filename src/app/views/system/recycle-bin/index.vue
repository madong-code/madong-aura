<template>
  <div class="sys-post-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import { $t } from "@/locales";
import { FilesService } from "@/api/system/files";
import { RecycleBinRow, RecycleBinService } from "@/api/system/recycle-bin";

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  // 左侧工具栏
  toolbarActions: [
    {
      label: $t("system.files.list.table.columns.actions.delete.label"),
      type: "danger",
      icon: "ant-design:delete-outlined",
      auth: "system:files:delete",
      ifShow: () => crudApi.getReadonlyState().selection.length > 0,
      confirm: {
        title: $t("system.files.list.table.columns.actions.delete.title"),
        content: $t("system.files.list.table.columns.actions.delete.confirm"),
        ok() {
          crudApi.removeByApi({});
        },
      },
    },
  ],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [],
  // 表格行操作
  tableActions: [
    {
      label: $t("system.recycle_bin.list.table.columns.actions.recover"),
      type: "primary",
      sort: 1020,
      link: true,
      icon: "ant-design:swap-outlined",
      auth: "system:recycle_bin:recover",
      onClick: (e: Event, record: any) => {
        handleRecover(record);
      },
    },
    {
      label: $t("system.files.list.table.columns.actions.delete.label"),
      type: "primary",
      sort: 1020,
      link: true,
      icon: "ant-design:delete-outlined",
      auth: "system:files:delete",
      confirm: {
        title: $t("system.files.list.table.columns.actions.delete.title"),
        content: $t("system.files.list.table.columns.actions.delete.confirm"),
        ok(record: any) {
          crudApi.removeByApi(record);
        },
      },
    },
  ],
  // 表格行操作-下拉菜单
  dropDownActions: [],
});

/**
 * 还原
 * @param row
 */
function handleRecover(row: RecycleBinRow) {
  RecycleBinService.restore({ id: row.id }).then(() => {
    ElMessage.success($t("common.message.success"));
    crudApi.reload();
  });
}
</script>
<style lang="scss" scoped></style>
