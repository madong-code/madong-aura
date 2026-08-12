<script setup lang="ts">
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { AuthService } from '#/api/system';
import { useDialog } from '#/components/dialog';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import AddUser from './add-user.vue';

const emit = defineEmits<{ success: [] }>();

const record = ref<any>({});
const addUserRef = ref();

const handleRemove = (row: any) => {
  dialogApi.setState({ loading: true, confirmLoading: true });
  AuthService.removeUserRole([{ role_id: record.value.id, admin_id: row.id }])
    .then(() => {
      ElMessage.success($t('system.role.member.message.delete_success'));
      crudApi.refreshRemove();
      emit('success');
    })
    .finally(() => {
      dialogApi.setState({ loading: false, confirmLoading: false });
    });
};

const handleBatchDelete = () => {
  const selection = crudApi.getRowSelection();
  if (selection.length === 0) return;
  const payload = selection.map((item: any) => ({
    role_id: record.value.id,
    admin_id: item.id,
  }));
  dialogApi.setState({ loading: true, confirmLoading: true });
  AuthService.removeUserRole(payload)
    .then(() => {
      ElMessage.success($t('system.role.member.message.delete_success'));
      crudApi.getGridInstance()?.clearCheckboxRow();
      crudApi.refreshRemove();
      emit('success');
    })
    .finally(() => {
      dialogApi.setState({ loading: false, confirmLoading: false });
    });
};

const [Dialog, dialogApi] = useDialog({
  title: $t('system.user.title'),
  width: '70%',
  dialogType: 'drawer',
  modal: true,
  closeOnClickModal: true,
  footer: false,
  destroyOnClose: true,
});

const [BasicCrud, crudApi] = useCrud({
  crudApi: {
    list: AuthService.getUserListByRoleId,
  },
  hasAdd: false,
  hasEdit: false,
  hasRemove: false,
  hasBatchRemove: false,
  beforeFetch(params: any) {
    return { ...params, role_id: record.value.id };
  },
  tableActionColumn: { width: '120px' },
  searchForm: {
    schema: [
      {
        fieldName: 'LIKE_user_name',
        label: $t('system.user.table.search.user_name'),
        component: 'Input',
        componentProps: {
          placeholder: $t('system.user.table.search.placeholder.user_name'),
        },
      },
      {
        fieldName: 'LIKE_real_name',
        label: $t('system.user.table.search.real_name'),
        component: 'Input',
        componentProps: {
          placeholder: $t('system.user.table.search.placeholder.real_name'),
        },
      },
      {
        fieldName: 'LIKE_mobile_phone',
        label: $t('system.user.table.search.mobile_phone'),
        component: 'Input',
        componentProps: {
          placeholder: $t('system.user.table.search.placeholder.mobile_phone'),
        },
      },
    ],
  },
  columns: [
    { type: 'checkbox', width: 70 },
    {
      field: 'user_name',
      title: $t('system.user.table.columns.user_name'),
      width: 150,
      align: 'left',
    },
    {
      field: 'real_name',
      title: $t('system.user.table.columns.real_name'),
      align: 'left',
    },
    {
      field: 'mobile_phone',
      title: $t('system.user.table.columns.mobile_phone'),
    },
  ],
  height: 'auto',
  toolbarActions: [
    {
      label: $t('system.role.member.add_user'),
      icon: 'ant-design:plus-outlined',
      type: 'primary',
      auth: 'system:auth:save_user_role',
      sort: -1,
      onClick: () => {
        addUserRef.value?.show({
          data: record.value,
          getCrudApi: () => crudApi,
        });
      },
    },
    {
      label: $t('system.role.member.remove_user'),
      type: 'danger',
      icon: 'ant-design:delete-outlined',
      auth: 'system:auth:remove_user_role',
      sort: 100,
      confirm: {
        title: $t('system.role.member.confirm.title'),
        content: $t('system.role.member.confirm.content'),
        ok() {
          handleBatchDelete();
        },
      },
      ifShow() {
        return crudApi.getRowSelection().length > 0;
      },
    },
  ],
  tableActions: [
    {
      label: $t('system.role.member.remove_user'),
      type: 'danger',
      link: true,
      icon: 'ant-design:delete-outlined',
      auth: 'system:auth:remove_user_role',
      confirm: {
        title: $t('system.role.member.confirm.title'),
        content: $t('system.role.member.confirm.content'),
        ok(record: any) {
          handleRemove(record);
        },
      },
    },
  ],
} as any);

defineExpose({
  show({ data }: { data: any }) {
    record.value = data;
    dialogApi.setState({
      title: $t('system.role.member.manage', { name: data.name }),
    });
    dialogApi.open();
  },
});
</script>

<template>
  <Dialog>
    <Page auto-content-height>
      <BasicCrud />
      <AddUser ref="addUserRef" />
    </Page>
  </Dialog>
</template>
