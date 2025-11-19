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
import { CrontabService } from "@/api/dev/crontab";
import { $t } from "@/locales";
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
      icon: "ant-design:right-circle-outlined",
      sort: 1020,
      link: true,
      auth: "dev:crontab:execute",
      onClick: async (e: Event, row: any) => {
        await CrontabService.execute(row.id);
        ElMessage.success($t("common.operation_success"));
      },
    },
    {
      label: "启动",
      type: "primary",
      sort: 1020,
      link: true,
      icon: "ant-design:play-circle-outlined",
      auth: "dev:crontab:start",
      onClick: async (e: Event, row: any) => {
        await CrontabService.start(row.id);
        ElMessage.success($t("common.operation_success"));
      },
    },
    {
      label: "恢复",
      type: "primary",
      sort: 1020,
      icon: "ant-design:close-circle-outlined",
      link: true,
      auth: "dev:crontab:resume",
      onClick: async (e: Event, row: any) => {
        await CrontabService.resume(row.id);
        ElMessage.success($t("common.operation_success"));
      },
    },
    {
      label: "停止",
      type: "primary",
      sort: 1020,
      icon: "ant-design:pause-circle-outlined",
      link: true,
      auth: "dev:crontab:pause",
      onClick: async (e: Event, row: any) => {
        await CrontabService.pause(row.id);
        ElMessage.success($t("common.operation_success"));
      },
    },
    {
      label: "日志",
      type: "primary",
      sort: 1020,
      icon: "ant-design:info-circle-outlined",
      link: true,
      auth: "dev:crontab:logs",
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
