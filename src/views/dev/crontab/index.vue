<template>
  <div class="sys-post-page art-full-height">
    <BasicCrud />
    <DictItemWrap ref="crontabLogsWrapRef" />
  </div>
</template>
<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import DictItemWrap from "./logs-wrap.vue";
const crontabLogsWrapRef = ref();

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema,
  // 左侧工具栏
  toolbarActions: [],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [],
  // 表格行操作
  tableActions: [],
  // 表格行操作-下拉菜单
  dropDownActions: [
    {
      label: "执行",
      type: "primary",
      sort: 1020,
      link: true,
      auth: "dev:crontab:edit",
      onClick: () => {},
    },
    {
      label: "启动",
      type: "primary",
      sort: 1020,
      link: true,
      auth: "dev:crontab:edit",
      onClick: () => {},
    },
    {
      label: "恢复",
      type: "primary",
      sort: 1020,
      link: true,
      auth: "dev:crontab:edit",
      onClick: () => {},
    },
    {
      label: "停止",
      type: "primary",
      sort: 1020,
      link: true,
      auth: "dev:crontab:edit",
      onClick: () => {},
    },
    {
      label: "日志",
      type: "primary",
      sort: 1020,
      link: true,
      auth: "dev:crontab:edit",
      dialogRef: crontabLogsWrapRef,
      dialogParams() {
        return {
          getCrudApi() {
            return crudApi;
          },
        };
      },
    },
  ],
});
</script>
<style lang="scss" scoped></style>
