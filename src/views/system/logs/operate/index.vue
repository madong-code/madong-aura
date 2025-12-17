<template>
  <div class="sys-post-page art-full-height">
    <BasicCrud />
  </div>
</template>
<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";

const [BasicCrud] = useCrud({
  ...crudSchema,
  useVxeTable: true,
  toolbarActions: [],
  dropDownToolbarActions: [],
  tableActions: [],
  dropDownActions: [],
});
</script>
<style lang="scss" scoped></style>
