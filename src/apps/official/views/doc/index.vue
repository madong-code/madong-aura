<template>
  <div class="official-doc-page art-full-height">
    <BasicCrud> </BasicCrud>
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";

const [BasicCrud] = useCrud({
  ...crudSchema(),
  // 表格行操作
  tableActions: [
    {
      label: "文档",
      type: "primary",
      sort: -1,
      link: true,
      icon: "ant-design:play-circle-outlined",
      auth: "official:doc:read",
      onClick: async (e: Event, row: any) => {
        alert("文档链接：" + row.link);
      },
    },
  ],
});
</script>
