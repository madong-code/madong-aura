<template>
  <Dialog>
    <BasicForm />
  </Dialog>
</template>

<script setup lang="ts">
import { UserService } from "@/api/system/user";
import { CrudMethods } from "@/components/crud";
import { useDialog } from "@/components/dialog";
import { useForm } from "@/components/form";
import { request } from "http";
const [BasicForm, formApi] = useForm({
  labelWidth: "100px",
  schema: [
    {
      label: "选择角色",
      prop: "roleIdList",
      component: "ApiSelect",
      componentProps: {
        api: "/system/role",
        params: { format: "select" },
        placeholder: "请选择角色",
        multiple: true,
      },
    },
  ],
});
const record = ref<any>({});
const crudApi = ref<CrudMethods>();
const [Dialog, dialogApi] = useDialog({
  title: "授权角色",
  // dialogType: 'drawer',
  // direction: 'rtl', // 从右侧滑入
  width: "50%",
  onConfirm: async () => {
    formApi.validate().then(async () => {
      const values = await formApi.getValues();
      dialogApi.setState({
        loading: true,
        confirmLoading: true,
      });
      UserService.grantRole({
        id: record.value.id,
        role_id_list: values?.role_id_list || [],
      })
        .then(() => {
          ElMessage.success("授权成功");
          crudApi.value?.refreshUpdate();
          dialogApi.close();
        })
        .finally(() => {
          dialogApi.setState({
            loading: false,
            confirmLoading: false,
          });
        });
    });
  },
});
defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudMethods }) {
    record.value = data;
    crudApi.value = getCrudApi();
    dialogApi.open();
    nextTick(() => {
      formApi.setValues({
        roleIdList: data.roleIds?.split(",") || [],
      });
    });
  },
});
</script>
