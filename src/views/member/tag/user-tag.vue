<template>
  <Dialog> <BasicCrud /> </Dialog>
  <AddUser ref="addUserRef" />
</template>
<script setup lang="tsx">
import { useDialog } from "@/components/dialog";
import { CrudReadonlyState, useCrud } from "@/components/crud";
import { AuthService } from "@/api/member/auth";
import AddUser from "./add-user.vue";
import { $t } from "@/locales";
const record = ref<any>({});
const addUserRef = ref();
const [Dialog, dialogApi] = useDialog({
  title: $t("member.tag.user.list_title"),
  width: "70%",
  dialogType: "drawer",
  modal: true,
  closeOnClickModal: true,
  footer: false,
  destroyOnClose: true,
});
const [BasicCrud, crudApi] = useCrud({
  api: AuthService.userListByTagId,
  beforeFetch(params: any) {
    // 请求参数处理
    return {
      ...params,
      tag_id: record.value.id,
    };
  },
  tableActionColumn: {
    width: 120,
  },
  useCrud: false,
  searchFormSchema: {
    schema: [
      {
        prop: "username",
        label: $t("member.tag.user.search.user_name"),
        component: "Input",
        componentProps: {
          placeholder: $t("member.tag.user.search.placeholder.user_name"),
        },
      },
      {
        prop: "nickname",
        label: $t("member.tag.user.search.real_name"),
        component: "Input",
        componentProps: {
          placeholder: $t("member.tag.user.search.placeholder.real_name"),
        },
      },
      {
        prop: "phone",
        label: $t("member.tag.user.search.mobile_phone"),
        component: "Input",
        componentProps: {
          placeholder: $t("member.tag.user.search.placeholder.mobile_phone"),
        },
      },
    ],
  },
  columns: [
    {
      type: "selection",
    },
    {
      prop: "username",
      label: $t("member.tag.user.table.columns.user_name"),
    },
    {
      prop: "nickname",
      label: $t("member.tag.user.table.columns.real_name"),
    },
    {
      prop: "phone",
      align: "center",
      formatter(row: any) {
        return row.phone || "/";
      },
      label: $t("member.tag.user.table.columns.mobile_phone"),
    },
  ],
  toolbarActions: [
    {
      label: $t("member.tag.user.actions.add_user"),
      icon: "ant-design:plus-outlined",
      type: "primary",
      dialogRef: addUserRef,
      auth: "member:auth:save_user_tag",
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
      label: $t("member.tag.user.actions.remove_user"),
      type: "danger",
      icon: "ant-design:delete-outlined",
      auth: "member:auth:remove_user_tag",
      confirm: {
        title: $t("member.tag.user.confirm.title"),
        content: $t("member.tag.user.confirm.content"),
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
      label: $t("member.tag.user.actions.remove_user"),
      type: "danger",
      link: true,
      icon: "ant-design:delete-outlined",
      auth: "system:auth:remove_user_role",
      confirm: {
        title: $t("member.tag.user.confirm.title"),
        content: $t("member.tag.user.confirm.content"),
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
  AuthService.removeUserTag(
    userIds.map((userId) => {
      return {
        tag_id: record.value.id,
        member_id: userId,
      };
    })
  )
    .then(() => {
      ElMessage.success($t("member.tag.user.message.delete_success"));
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
      title: $t("member.tag.user.member_manage", { name: data.name }),
    });
    dialogApi.open();
    nextTick(() => {
      readonlyState.value = crudApi.getReadonlyState();
    });
  },
});
</script>
<style lang="scss" scoped></style>
