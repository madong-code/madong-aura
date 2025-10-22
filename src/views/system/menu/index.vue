<template>
  <div class="user-page art-full-height">
    <BasicCrud />
    <InterfaceForm ref="interfaceRef" />
  </div>
</template>
<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import InterfaceForm from "./initerface.vue";

const interfaceRef = ref();
const [BasicCrud, crudApi] = useCrud({
  ...crudSchema,
  beforeFetch: (params: any) => {
    return { ...params, format: "table_tree", page: 1, limit: 9999 };
  },
  // hasAdd: true,
  // 左侧工具栏
  toolbarActions: [],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [],
  tableActions: [
    // {
    //   label: "选择权限",
    //   type: "primary",
    //   sort: 1010,
    //   link: true,
    //   icon: "ant-design:setting-outlined",
    //   auth: "system:auth:save_role_menu",
    //   dialogRef: interfaceRef,
    //   dialogParams(record) {
    //     return {
    //       data: record,
    //       getCrudApi() {
    //         return crudApi;
    //       },
    //     };
    //   },
    // },
  ],
  // 表格行操作-下拉菜单
  dropDownActions: [],
});
</script>
<style lang="scss" scoped></style>
