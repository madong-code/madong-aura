<template>
  <div class="sys-dept-page art-full-height">
    <BasicCrud />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";

const [BasicCrud] = useCrud({
  ...crudSchema,
  beforeFetch: (params: any) => {
    return { ...params, format: "table_tree" };
  },
  toolbarActions: [],
  dropDownToolbarActions: [],
  tableActions: [],
  dropDownActions: [],
});
</script>

<style lang="scss" scoped>
.sys-dept-page {
  height: 100%;
}
</style>
