<template>
  <div class="user-page art-full-height">
    <BasicCrud />
    <InterfaceForm ref="interfaceRef" />
  </div>
</template>
<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import InterfaceForm from "./initerface-list.vue";

const interfaceRef = ref();
const [BasicCrud, crudApi] = useCrud({
  ...crudSchema,
  beforeFetch: (params: any) => {
    return { ...params, format: "table_tree", page: 1, limit: 9999 };
  },
  tableActionColumn: {},
  // 左侧工具栏
  toolbarActions: [],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [],
  tableActions: [],
  // 表格行操作-下拉菜单
  dropDownActions: [
    {
      label: "选择权限",
      type: "primary",
      sort: 1020,
      link: true,
      icon: "ant-design:safety-certificate-filled",
      auth: "system:auth:save_role_menu",
      dialogRef: interfaceRef,
      dialogParams(record) {
        return {
          data: record,
          getCrudApi() {
            return crudApi;
          },
        };
      },
    },
  ],
});
</script>
<style lang="scss" scoped></style>
