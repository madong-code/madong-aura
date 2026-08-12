<script setup lang="ts">
/** 授权码认证对话框 */
import { ElMessage } from 'element-plus';

import { useVbenForm as useForm } from '#/adapter/form';
import { AppPluginDelegationService } from '#/api/app/plugin/delegation';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

defineOptions({ name: 'AuthorizationDialog' });

const emit = defineEmits<{
  success: [];
}>();

const [BasicForm, formApi] = useForm({
  commonConfig: {
    labelWidth: 120,
  },
  showDefaultActions: false,
  schema: [
    {
      label: $t('app.plugin.auth.dialog.auth_code'),
      fieldName: 'auth_code',
      component: 'Input',
      rules: 'required',
      formItemClass: 'mb-4',
      componentProps: {
        placeholder: $t('app.plugin.auth.dialog.auth_code_placeholder'),
      },
    },
    {
      label: $t('app.plugin.auth.dialog.auth_secret'),
      fieldName: 'auth_secret',
      component: 'Input',
      rules: 'required',
      formItemClass: 'mb-4',
      componentProps: {
        placeholder: $t('app.plugin.auth.dialog.auth_secret_placeholder'),
      },
    },
  ],
});

const [Dialog, dialogApi] = useDialog({
  title: $t('app.plugin.auth.dialog.title'),
  width: '500px',
  draggable: true,
  destroyOnClose: true,
  onConfirm: async () => {
    try {
      dialogApi.setState({ loading: true, confirmLoading: true });
      const values = await formApi.getValues();
      await AppPluginDelegationService.setAuthInfo({
        auth_code: String(values.auth_code),
        auth_secret: String(values.auth_secret),
      });
      ElMessage.success($t('app.plugin.auth.dialog.success'));
      formApi.resetForm();
      emit('success');
      dialogApi.close();
    } catch {
      // error handled by service
    } finally {
      dialogApi.setState({ loading: false, confirmLoading: false });
    }
  },
  onCancel: () => {
    formApi.resetForm();
    dialogApi.close();
  },
});

const openDialog = () => {
  dialogApi.open();
};

defineExpose({
  openDialog,
});
</script>

<template>
  <Dialog>
    <div class="px-4 py-6">
      <BasicForm />
    </div>
  </Dialog>
</template>
