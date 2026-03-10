<template>
  <div class="message-page art-full-height">
    <BasicCrud />
    <Form ref="formRef" @reload="crudApi.refreshSoft()" />
  </div>
</template>
<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";

import Form from "./modules/form.vue";
const formRef = ref();

// 定义onActionClick函数
const onActionClick = ({ code, row }: { code: string; row: any }) => {
  // 在这里处理点击逻辑
  if (code === "read") {
    formRef.value.show({ data: row, getCrudApi: () => crudApi });
  }
};

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(onActionClick),
  // 左侧工具栏
  toolbarActions: [],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [
    {
      label: crudSchema().removeButtonText || "批量删除",
      type: "primary",
      sort: 10,
      link: true,
      icon: "ant-design:delete-outlined",
      auth: crudSchema().removeAuth,
      onClick() {
        crudApi.executeBatchRemove();
      },
    },
  ],
  // 表格行操作
  tableActions: [],
  // 表格行操作-下拉菜单
  dropDownActions: [],
});
</script>
<style lang="scss" scoped></style>
