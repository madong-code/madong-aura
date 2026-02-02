<template>
  <Dialog>
    <BasicForm />
  </Dialog>
</template>

<script lang="ts" setup>
import {  type FormItemSchema, useForm } from "@/components/form";
import { useDialog } from "@/components/dialog";
import { ToolsAuthService } from "@/app/api/tools/delegation";
import { ElMessage } from "element-plus";
import { $t } from "@/locales";

const schema=()=>{
  return  [
  {
    prop: "auth_code",
    label: $t('tools.delegation.dialog.auth_code'),
    component: "Input",
    colSpan: 24,
    defaultValue: "",
    rules: [{ required: true, message: $t('tools.delegation.dialog.auth_code_required'), trigger: "blur" }],
  },
  {
    prop: "auth_secret",
    label: $t('tools.delegation.dialog.auth_secret'),
    component: "Input",
    colSpan: 24,
     rules: [{ required: true, message: $t('tools.delegation.dialog.auth_secret_required'), trigger: "blur" }],
    componentProps: {
      placeholder: $t('tools.delegation.dialog.auth_secret_placeholder'),
    },
  },
]as FormItemSchema[]

}

const [BasicForm, formApi] = useForm({
  labelPosition: 'right',
  labelWidth: '120px',
  schema: schema()
})


const [Dialog, dialogApi] = useDialog({
  title: $t('tools.delegation.dialog.title'),
  width: '500px',
  draggable: true,
  destroyOnClose: true,
  onConfirm: () => {
    formApi.validate().then(async (valid) => {
      if (valid) {
        // 提交表单数据
        await ToolsAuthService.setAuthInfo(formApi.getValues())
        ElMessage.success($t('tools.delegation.dialog.success'))
        formApi.resetFields()
        dialogApi.close();
      }
    });
  },
  onCancel: () => {
    formApi.resetFields()
    dialogApi.close();
  }
})

const openDialog = () => {
  dialogApi.open();
}

defineExpose({
  openDialog,
});
</script>
