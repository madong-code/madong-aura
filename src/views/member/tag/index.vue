<template>
  <div class="member-tag-page art-full-height">
    <BasicCrud />
    <AuthMenu ref="authMenuRef" />
    <UserRole ref="userRoleRef" />
  </div>
</template>

<script setup lang="tsx">
import { useCrud } from "@/components/crud";
import { crudSchema } from "./schemas";
import AuthMenu from "./auth-menu.vue";
import UserRole from "./user-tag.vue";

const authMenuRef = ref();
const userRoleRef = ref();

const [BasicCrud, crudApi] = useCrud({
  ...crudSchema(),
  tableActionColumn: {
    width: 320,
  },
  tableActions: [
    {
      label: "授权菜单",
      type: "primary",
      sort: 1010,
      link: true,
      icon: "ant-design:setting-outlined",
      auth: "member:auth:save_tag_menu",
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
      auth: "member:auth:user_list_by_tab_id",
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
