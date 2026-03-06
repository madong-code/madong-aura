<template>
  <div class="ask-tag-page art-full-height">
    <BasicCrud />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  beforeFetch: (params: any) => {
    return params;
  },
});
</script>
