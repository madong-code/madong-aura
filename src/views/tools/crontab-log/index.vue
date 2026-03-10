<template>
  <div class="sys-post-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";

const props = defineProps({
  crontab_id: {
    type: [String, Number],
    default: undefined,
  },
});

const [BasicCrud] = useCrud({
  ...crudSchema(),
  beforeFetch(params) {
    return {
      ...params,
      crontab_id: props.crontab_id,
    };
  },
  // 左侧工具栏
  toolbarActions: [],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [],
  // 表格行操作
  tableActions: [],
  // 表格行操作-下拉菜单
  dropDownActions: [],
});
</script>
<style lang="scss" scoped></style>
