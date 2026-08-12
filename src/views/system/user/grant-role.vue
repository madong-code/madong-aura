<script setup lang="ts">
import type { CrudApiInstance } from '#/components/crud/components/types';

import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { useVbenForm as useForm } from '#/adapter/form';
import { UserService } from '#/api/system/user';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

const emit = defineEmits<{
  success: [];
}>();

const record = ref<Record<string, any>>({});
const crudApi = ref<CrudApiInstance>();
const formKey = ref(0);

const [BasicForm, formApi] = useForm({
  commonConfig: {
    labelWidth: 100,
  },
  showDefaultActions: false,
  wrapperClass: 'grant-role-form',
  schema: [
    {
      label: $t('system.user.form.role_name'),
      fieldName: 'role_id_list',
      component: 'ApiSelect',
      componentProps: {
        api: '/system/role',
        params: { format: 'select' },
        resultField: 'data',
        multiple: true,
        placeholder: $t('system.user.form.placeholder.role_name'),
      },
    },
  ],
});

const [Dialog, dialogApi] = useDialog({
  title: $t('system.user.action.grant_role'),
  width: '50%',
  draggable: true,
  onConfirm: async () => {
    try {
      dialogApi.setState({ loading: true, confirmLoading: true });
      const values = await formApi.getValues();
      await UserService.grantRole({
        id: record.value.id,
        role_id_list: values?.role_id_list || [],
      });
      ElMessage.success($t('system.user.confirm.grant_role_success'));
      crudApi.value?.refreshUpdate();
      emit('success');
      dialogApi.close();
    } catch {
      // error handled by service
    } finally {
      dialogApi.setState({ loading: false, confirmLoading: false });
    }
  },
});

function parseRoleIds(data: any): (number | string)[] {
  if (Array.isArray(data?.roles)) {
    return data.roles.map((role: any) => role.id);
  }
  if (typeof data?.roles === 'string') {
    return data.roles.split(',').filter(Boolean);
  }
  return [];
}

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudApiInstance }) {
    record.value = data;
    crudApi.value = getCrudApi();
    formKey.value++;
    formApi.setValues({ role_id_list: parseRoleIds(data) });
    dialogApi.open();
  },
});
</script>

<template>
  <Dialog>
    <div class="grant-role-form-wrap" :key="formKey">
      <BasicForm />
    </div>
  </Dialog>
</template>

<style scoped>
.grant-role-form-wrap {
  padding: 48px 20px;
}
</style>
