<template>
  <div class="official-market-page art-full-height">
    <BasicCrud />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";

const [BasicCrud] = useCrud({
  ...crudSchema(),
  beforeFetch: (params: any) => {
    // return { ...params, format: "table_tree", page: 1, limit: 9999 };
  },
});
</script>
