<template>
  <div class="market-apps-page art-full-height">
    <BasicCrud />
    <Form ref="formRef" />
    <VersionForm ref="versionFormRef" />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import Form from "./form.vue";
import VersionForm from "./version-form.vue";
import { ElMessage } from "element-plus";
import { MarketAppService } from "@/apps/official/api/market/app";

const formRef = ref<any>(null);
const versionFormRef = ref<any>(null);

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  beforeFetch: (params: any) => {
    return params;
  },
  toolbarActions: [
    {
      label: "新增",
      type: "primary",
      sort: -1,
      icon: "ant-design:plus-outlined",
      auth: "official:doc:create",
      dialogRef: formRef,
      dialogParams() {
        return {
          data: {},
          getCrudApi() {
            return crudApi;
          },
          type: "add",
        };
      },
    },
  ],
  tableActions: [
    {
      label: "编辑",
      type: "primary",
      sort: -1,
      link: true,
      icon: "ant-design:edit-outlined",
      auth: "official:doc:update",
      dialogRef: formRef,
      dialogParams(record) {
        return {
          data: record,
          getCrudApi() {
            return crudApi;
          },
          type: "edit",
        };
      },
    },
  ],
  dropDownActions: [
    {
      label: "发布版本",
      type: "primary",
      icon: "ri:add-box-fill",
      auth: "official:doc:release",
      dialogRef: versionFormRef,
      dialogParams(record: any) {
        return {
          data: record,
          getCrudApi() {
            return crudApi;
          },
        };
      },
    },
  ],
});
</script>
