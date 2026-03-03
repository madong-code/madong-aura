<template>
  <div class="plugin-develop-page art-full-height">
    <BasicCrud />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import { PluginDevelopRow } from "@/api/tools/plugin-develop/model";

const [BasicCrud] = useCrud({
  ...crudSchema(),
  beforeFetch: (params: any) => {
  },
  toolbarActions: [],
  dropDownToolbarActions: [],
  tableActions: [
    {
      label: "打包插件",
      type: "primary",
      sort: 1010,
      link: true,
      icon: "ant-design:setting-outlined",
      auth: "plugin:develop:package",
      onClick(event:any, record:any) {
       
      },
    },
  ],
  dropDownActions: [],
});
</script>

<style lang="scss" scoped>
.plugin-develop-page {
  height: 100%;
}
</style>
