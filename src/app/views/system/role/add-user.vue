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
import { AuthService } from "@/app/api/system/auth";
import { $t } from "@/locales";
const record = ref<any>({});
const deptIdList = ref<any>([]);
const parentCrudApi = ref<CrudMethods>();
const [Dialog, dialogApi] = useDialog({
  title: "添加用户",
  width: "60%",
  modal: true,
  draggable: true,
  destroyOnClose: true,
  onConfirm: () => {
    const selection = crudApi.getRowSelection();
    if (selection.length === 0) {
      ElMessage.warning("请选择用户");
      return;
    }
    dialogApi.setState({
      confirmLoading: true,
      loading: true,
    });
    AuthService.saveUserRole(
      selection.map((item: any) => {
        return {
          role_id: record.value.id,
          admin_id: item.id,
        };
      })
    )
      .then(() => {
        ElMessage.success("保存成功");
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
  api: AuthService.userListExcludeRoleId,
  beforeFetch(params: any) {
    // 请求参数处理
    return {
      ...params,
      role_id: record.value.id,
    };
  },
  useCrud: false,
  searchFormSchema: {
    schema: [
      {
        prop: "LIKE_user_name",
        label: $t("system.user.list.query.user_name"),
        component: "Input",
        componentProps: {
          placeholder: $t("system.user.list.query.placeholder.user_name"),
        },
        colSpan: 8,
      },
      {
        prop: "LIKE_real_name",
        label: $t("system.user.list.query.real_name"),
        component: "Input",
        componentProps: {
          placeholder: $t("system.user.list.query.placeholder.real_name"),
        },
        colSpan: 8,
      },
      {
        prop: "LIKE_mobile_phone",
        label: $t("system.user.list.query.mobile_phone"),
        component: "Input",
        componentProps: {
          placeholder: $t("system.user.list.query.placeholder.mobile_phone"),
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
