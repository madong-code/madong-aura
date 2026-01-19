<template>
  <Dialog> <BasicCrud /> </Dialog>
  <AddUser ref="addUserRef" />
</template>
<script setup lang="tsx">
import { useDialog } from "@/components/dialog";
import { CrudReadonlyState, useCrud } from "@/components/crud";
import { AuthService } from "@/app/api/system/auth";
import AddUser from "./add-user.vue";
import { $t } from "@/locales";
const record = ref<any>({});
const addUserRef = ref();
const [Dialog, dialogApi] = useDialog({
  title: $t("system.user.list.title"),
  width: "70%",
  dialogType: "drawer",
  modal: true,
  closeOnClickModal: true,
  footer: false,
  destroyOnClose: true,
});
const [BasicCrud, crudApi] = useCrud({
  api: AuthService.userListByRoleId,
  beforeFetch(params: any) {
    // 请求参数处理
    return {
      ...params,
      role_id: record.value.id,
    };
  },
  tableActionColumn: {
    width: "120px",
  },
  useCrud: false,
  searchFormSchema: {
    schema: [
      {
        prop: "user_name",
        label: $t("system.user.list.query.user_name"),
        component: "Input",
        componentProps: {
          placeholder: $t("system.user.list.query.placeholder.user_name"),
        },
      },
      {
        prop: "real_name",
        label: $t("system.user.list.query.real_name"),
        component: "Input",
        componentProps: {
          placeholder: $t("system.user.list.query.placeholder.real_name"),
        },
      },
      {
        prop: "mobile_phone",
        label: $t("system.user.list.query.mobile_phone"),
        component: "Input",
        componentProps: {
          placeholder: $t("system.user.list.query.placeholder.mobile_phone"),
        },
      },
    ],
  },
  columns: [
    {
      type: "selection",
    },
    {
      prop: "user_name",
      label: $t("system.user.list.table.columns.user_name"),
    },
    {
      prop: "real_name",
      label: $t("system.user.list.table.columns.real_name"),
    },
    {
      prop: "mobile_phone",
      label: $t("system.user.list.table.columns.mobile_phone"),
    },
  ],
  toolbarActions: [
    {
      label: "添加用户",
      icon: "ant-design:plus-outlined",
      type: "primary",
      dialogRef: addUserRef,
      auth: "system:auth:save_user_role",
      dialogParams() {
        return {
          data: record.value,
          getCrudApi() {
            return crudApi;
          },
        };
      },
    },
    {
      label: "移除用户",
      type: "danger",
      icon: "ant-design:delete-outlined",
      auth: "system:auth:delete_user_role",
      confirm: {
        title: "提示",
        content: "确定删除吗？",
        ok() {
          handleRemove({});
        },
      },
      ifShow() {
        return readonlyState.value?.selection.length > 0;
      },
    },
  ],
  tableActions: [
    {
      label: "移除用户",
      type: "danger",
      link: true,
      icon: "ant-design:delete-outlined",
      auth: "system:auth:remove_user_role",
      confirm: {
        title: "提示",
        content: "确定删除吗？",
        ok(record: any) {
          handleRemove(record);
        },
      },
    },
  ],
});
const handleRemove = (row: any) => {
  const userIds = row.id
    ? [row.id]
    : readonlyState.value.selection.map((item: any) => item.id);
  dialogApi.setState({
    loading: true,
    confirmLoading: true,
  });
  AuthService.removeUserRole(
    userIds.map((userId) => {
      return {
        role_id: record.value.id,
        admin_id: userId,
      };
    })
  )
    .then(() => {
      ElMessage.success("删除成功");
      crudApi.refreshRemove();
    })
    .finally(() => {
      dialogApi.setState({
        loading: false,
        confirmLoading: false,
      });
    });
};
const readonlyState = ref<CrudReadonlyState>({
  selection: [],
});
defineExpose({
  show({ data }: { data: any }) {
    record.value = data;
    dialogApi.setState({
      title: `【${data.name}】成员管理`,
    });
    dialogApi.open();
    nextTick(() => {
      readonlyState.value = crudApi.getReadonlyState();
    });
  },
});
</script>
<style lang="scss" scoped></style>
