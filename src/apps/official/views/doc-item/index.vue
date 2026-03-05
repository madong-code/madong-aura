<template>
  <div class="official-doc-page art-full-height">
    <BasicCrud />
    <Form ref="formRef" />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import Form from "./form.vue";

const route = useRoute();
const router = useRouter();
const formRef = ref<any>(null);

const getRouteParams = () => {
  // 优先使用路径参数
  if (route.params.id) {
    return route.params.id as string;
  }
  // 其次使用查询参数
  if (route.query.id) {
    return route.query.id as string;
  }
  // 还可以支持其他查询参数名称
  if (route.query.doc_id) {
    return route.query.doc_id as string;
  }
  return null;
};

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  beforeFetch: (params: any) => {
    params.page = 0;
    params.limit = 9999;
    params.format = "table_tree";
    params.project_id = getRouteParams();
    return params;
  },
  //工具栏配置
  toolbarActions: [
    {
      label: "新增",
      type: "primary",
      sort: -1,
      icon: "ant-design:plus-outlined",
      auth: "official:doc-item:create",
      dialogRef: formRef,
      dialogParams(record) {
        return {
          data: { ...record, project_id: getRouteParams() },
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
      link: true,
      sort: -1,
      icon: "ant-design:edit-outlined",
      auth: "official:doc-item:update",
      dialogRef: formRef,
      dialogParams(record: any) {
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
  // 表格行操作
  dropDownActions: [
    {
      label: "添加文档",
      type: "primary",
      sort: -1,
      link: true,
      icon: "ant-design:file-text-outlined",
      auth: "official:doc-item:create",
      dialogRef: formRef,
      dialogParams(record) {
        return {
          data: { pid: record.id, project_id: getRouteParams() },
          getCrudApi() {
            return crudApi;
          },
          type: "add",
        };
      },
      ifShow(action, record) {
        return Number(record.type) === 1;
      },
    },
  ],
});
</script>
