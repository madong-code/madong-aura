<template>
  <div class="role-page art-full-height">
    <BasicCrud />
    <AuthMenu ref="authMenuRef" />
    <UserRole ref="userRoleRef" />
  </div>
</template>
<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import AuthMenu from "./auth-menu.vue";
import UserRole from "./user-role.vue";
const authMenuRef = ref();
const userRoleRef = ref();
const [BasicCrud, crudApi] = useCrud({
  ...crudSchema,
  tableActionColumn: {
    width: 320,
  },
  // 是否有修改
  hasEdit: false,
  // hasAdd: true,
  // 左侧工具栏
  toolbarActions: [],
  // 左侧栏工具-下拉菜单
  dropDownToolbarActions: [],
  // 表格行操作
  tableActions: [
    {
      label: "授权菜单",
      type: "primary",
      sort: 1010,
      link: true,
      icon: "ant-design:setting-outlined",
      auth: "system:auth:save_role_menu",
      dialogRef: authMenuRef,
      dialogParams(record) {
        return {
          data: record,
          getCrudApi() {
            return crudApi;
          },
        };
      },
    },
    {
      label: "成员管理",
      type: "primary",
      sort: 1010,
      link: true,
      icon: "ant-design:team-outlined",
      auth: "system:auth:user_list_by_role_id",
      dialogRef: userRoleRef,
      dialogParams(record) {
        return {
          data: record,
          getCrudApi() {
            return crudApi;
          },
        };
      },
    },
  ],
  // 表格行操作-下拉菜单
  dropDownActions: [
    {
      label: crudSchema.editButtonText || "编辑",
      type: "primary",
      sort: 10,
      link: true,
      icon: "ant-design:edit-outlined",
      auth: crudSchema.editAuth,
      onClick() {
        crudApi.openEditDialog();
      },
    },
  ],
});
</script>
<style lang="scss" scoped></style>
