<template>
  <div class="user-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
const [BasicCrud] = useCrud({
  ...crudSchema,
  beforeFetch: (params: any) => {
    return { ...params, format: "table_tree", page: 1, limit: 9999 };
  },
  // hasAdd: true,
  // 左侧工具栏
  toolbarActions: [],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [],
  tableActions: [],
  // 表格行操作-下拉菜单
  dropDownActions: [],
});
</script>
<style lang="scss" scoped></style>
