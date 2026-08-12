<script setup lang="ts">
import type { CrudApiInstance } from '#/adapter/crud';

import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { AuthService } from '#/api/system';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

const emit = defineEmits<{ success: [] }>();

const record = ref<any>({});
const parentCrudApi = ref<CrudApiInstance>();

const [Dialog, dialogApi] = useDialog({
  title: $t('system.role.member.add_user_title'),
  width: '60%',
  modal: true,
  draggable: true,
  destroyOnClose: true,
  onConfirm: () => {
    const selection = crudApi.getRowSelection();
    if (selection.length === 0) {
      ElMessage.warning($t('system.role.member.message.select_user'));
      return;
    }
    dialogApi.setState({ confirmLoading: true, loading: true });
    AuthService.saveUserRole(
      selection.map((item: any) => ({
        role_id: record.value.id,
        admin_id: item.id,
      })),
    )
      .then(() => {
        ElMessage.success($t('system.role.member.message.save_success'));
        crudApi.refreshRemove();
        parentCrudApi.value?.refreshCreate();
        emit('success');
        dialogApi.close();
      })
      .finally(() => {
        dialogApi.setState({ confirmLoading: false, loading: false });
      });
  },
});

const [BasicCrud, crudApi] = useCrud({
  crudApi: { list: AuthService.getUserListExcludeRoleId },
  beforeFetch(params: any) {
    return { ...params, role_id: record.value.id };
  },
  hasAdd: false,
  hasEdit: false,
  hasRemove: false,
  hasBatchRemove: false,
  height: '500px',
  searchForm: {
    schema: [
      {
        fieldName: 'LIKE_user_name',
        label: $t('system.user.table.search.user_name'),
        component: 'Input',
        componentProps: {
          placeholder: $t('system.user.table.search.placeholder.user_name'),
        },
        colSpan: 8,
      },
      {
        fieldName: 'LIKE_real_name',
        label: $t('system.user.table.search.real_name'),
        component: 'Input',
        componentProps: {
          placeholder: $t('system.user.table.search.placeholder.real_name'),
        },
        colSpan: 8,
      },
      {
        fieldName: 'LIKE_mobile_phone',
        label: $t('system.user.table.search.mobile_phone'),
        component: 'Input',
        componentProps: {
          placeholder: $t('system.user.table.search.placeholder.mobile_phone'),
        },
        colSpan: 8,
      },
    ],
  },
  columns: [
    { type: 'checkbox', width: 50 },
    {
      field: 'user_name',
      title: $t('system.user.table.columns.user_name'),
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
      align: 'center',
    },
  ],
} as any);

const handleReset = () => {
  // search form reset handler
};

defineExpose({
  show({ data, getCrudApi }: { data: any; getCrudApi: () => CrudApiInstance }) {
    record.value = data;
    parentCrudApi.value = getCrudApi();
    dialogApi.open();
  },
});
</script>

<template>
  <Dialog>
    <BasicCrud @reset="handleReset" />
  </Dialog>
</template>

<style lang="scss" scoped>
.user-content {
  flex-grow: 1;
  min-width: 0;
  height: 100%;
}
</style>
