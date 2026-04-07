<template>
  <Dialog>
    <div class="user-content art-full-height">
      <BasicCrud @reset="handleReset" />
    </div>
  </Dialog>
</template>
<script setup lang="tsx">
import { useDialog } from "@/components/dialog";
import { CrudMethods, useCrud } from "@/components/crud";
import { AuthService } from "@/api/member/auth";
import { $t } from "@/locales";
const record = ref<any>({});
const deptIdList = ref<any>([]);
const parentCrudApi = ref<CrudMethods>();
const [Dialog, dialogApi] = useDialog({
  title: $t("member.tag.user.add_title"),
  width: "60%",
  modal: true,
  draggable: true,
  destroyOnClose: true,
  onConfirm: () => {
    const selection = crudApi.getRowSelection();
    if (selection.length === 0) {
      ElMessage.warning($t("member.tag.user.message.select_user"));
      return;
    }
    dialogApi.setState({
      confirmLoading: true,
      loading: true,
    });
    AuthService.saveUserTag(
      selection.map((item: any) => {
        return {
          tag_id: record.value.id,
          member_id: item.id,
        };
      })
    )
      .then(() => {
        ElMessage.success($t("member.tag.user.message.save_success"));
        // 当前可选列表查当于删除数据，所以使用删除刷新
        crudApi.refreshRemove();
        // 用户角色列表会新增数据，所以使用新增刷新
        parentCrudApi.value?.refreshCreate();
      })
      .finally(() => {
        dialogApi.setState({
          confirmLoading: false,
          loading: false,
        });
      });
  },
});
const [BasicCrud, crudApi] = useCrud({
  api: AuthService.userListExcludeTagId,
  beforeFetch(params: any) {
    // 请求参数处理
    return {
      ...params,
      tag_id: record.value.id,
    };
  },
  useCrud: false,
  searchFormSchema: {
    schema: [
      {
        prop: "LIKE_username",
        label: $t("member.tag.user.search.user_name"),
        component: "Input",
        componentProps: {
          placeholder: $t("member.tag.user.search.placeholder.user_name"),
        },
        colSpan: 8,
      },
      {
        prop: "LIKE_nickname",
        label: $t("member.tag.user.search.real_name"),
        component: "Input",
        componentProps: {
          placeholder: $t("member.tag.user.search.placeholder.real_name"),
        },
        colSpan: 8,
      },
      {
        prop: "EQ_phone",
        label: $t("member.tag.user.search.mobile_phone"),
        component: "Input",
        componentProps: {
          placeholder: $t("member.tag.user.search.placeholder.mobile_phone"),
        },
        colSpan: 8,
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
      label: $t("member.tag.user.table.columns.mobile_phone"),
    },
  ],
});
const handleCheck = () => {
  crudApi.reload();
};
const handleReset = () => {
  deptIdList.value = [];
};
defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
    record.value = data;
    parentCrudApi.value = getCrudApi();
    dialogApi.open();
  },
});
</script>
<style lang="scss" scoped>
.user-content {
  flex-grow: 1;
  min-width: 0;
  height: 100%;
}

.art-table-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
