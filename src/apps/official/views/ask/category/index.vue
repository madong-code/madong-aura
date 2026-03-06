<template>
  <div class="ask-category-page art-full-height">
    <BasicCrud />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
});
</script>
