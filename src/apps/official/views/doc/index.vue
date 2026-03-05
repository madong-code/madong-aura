<template>
  <div class="official-doc-page art-full-height">
    <BasicCrud />
    <Form ref="formRef" />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import { useRouter } from "vue-router";
import { DocProjectService } from "../../api";
import Form from "./form.vue";

const router = useRouter();
const formRef = ref<any>(null);

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  // 表格行操作
  tableActionColumn: {
    width: 300,
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
      label: "文档",
      type: "primary",
      sort: -1,
      link: true,
      icon: "ant-design:file-text-outlined",
      auth: "official:doc:read",
      onClick: async (e: Event, row: any) => {
        router.push({
          path: "/official/doc-item",
          query: {
            doc_id: row.id,
          },
        });
      },
    },
    {
      label: "复制",
      type: "primary",
      sort: -1,
      link: true,
      icon: "ant-design:copy-outlined",
      auth: "official:doc:clone",
      onClick: async (e: Event, row: any) => {
        await DocProjectService.clone(row.id);
        ElMessage.success("克隆成功");
      },
    },
  ],
});
</script>
