<template>
  <div class="user-page art-full-height">
    <BasicCrud @reset="handleReset" />
    <GrantRole ref="grantRoleRef" />
    <Form ref="formRef" />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import GrantRole from "./grant-role.vue";
import Form from "./form.vue";
import { $t } from "@/locales";
// import DeptTree from "./dept-tree.vue";
const grantRoleRef = ref();
const formRef = ref();
const deptIdList = ref([]);

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  // beforeFetch: (params: any) => {
  //   return { ...params};
  // },
  // hasAdd: true,
  // 左侧工具栏
  toolbarActions: [
    {
      label: $t("system.user.button.create"),
      icon: "ant-design:plus-outlined",
      type: "primary",
      dialogRef: formRef,
      auth: "system:user:create",
      dialogParams() {
        return {
          getCrudApi: () => crudApi,
        };
      },
    },
  ],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [],
  // 表格行操作
  tableActions: [
    {
      label: $t("system.user.button.edit"),
      icon: "ant-design:edit-outlined",
      type: "primary",
      link: true,
      dialogRef: formRef,
      auth: "system:user:edit",
      dialogParams() {
        return {
          getCrudApi: () => crudApi,
        };
      },
    },
  ],
  // 表格行操作-下拉菜单
  dropDownActions: [
    {
      label: $t("system.user.button.grant_role"),
      icon: "ant-design:team-outlined",
      type: "primary",
      link: true,
      ifShow(action, record) {
        return record?.is_super !== 1;
      },
      dialogRef: grantRoleRef,
      dialogParams() {
        return {
          getCrudApi: () => crudApi,
        };
      },
    },
  ],
});
const handleCheck = () => {
  crudApi.reload();
};
const handleReset = () => {
  deptIdList.value = [];
};
</script>
<style lang="scss" scoped>
.tree-container {
  box-sizing: border-box;
  display: flex;
  height: 100%;
  // gap: 16px;
  .left-sidebar {
    flex-shrink: 0;
    width: 280px;
    height: 100%;
  }

  .right-content {
    flex-grow: 1;
    min-width: 0;
    height: 100%;
  }

  .art-table-card {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

@media screen and (max-width: 800px) {
  .tree-container {
    display: block;
    gap: 0;
    height: auto;

    .left-sidebar {
      width: 100%;
      height: auto;
      margin-bottom: 20px;
    }
  }
}
</style>
