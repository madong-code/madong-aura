<script setup lang="ts">
import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { MemberAuthService } from '#/api/member/auth';
import { useDialog } from '#/components/dialog';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import AddUser from './add-user.vue';

const record = ref<any>({});
const addUserRef = ref();

const handleRemove = (row: any) => {
  dialogApi.setState({ loading: true, confirmLoading: true });
  MemberAuthService.removeUserTag([
    { tag_id: record.value.id, member_id: row.id },
  ])
    .then(() => {
      ElMessage.success($t('member.tag.user.message.delete_success'));
      crudApi.refreshRemove();
    })
    .finally(() => {
      dialogApi.setState({ loading: false, confirmLoading: false });
    });
};

const handleBatchDelete = () => {
  const selection = crudApi.getRowSelection();
  if (selection.length === 0) return;
  const memberIds = selection.map((item: any) => item.id);
  dialogApi.setState({ loading: true, confirmLoading: true });
  MemberAuthService.removeUserTag(
    memberIds.map((member_id: number) => ({
      tag_id: record.value.id,
      member_id,
    })),
  )
    .then(() => {
      ElMessage.success($t('member.tag.user.message.delete_success'));
      crudApi.getGridInstance()?.clearCheckboxRow();
      crudApi.refreshRemove();
    })
    .finally(() => {
      dialogApi.setState({ loading: false, confirmLoading: false });
    });
};

const [Dialog, dialogApi] = useDialog({
  title: $t('member.tag.user.list_title'),
  width: '70%',
  dialogType: 'drawer',
  modal: true,
  closeOnClickModal: true,
  footer: false,
  destroyOnClose: true,
});

const [BasicCrud, crudApi] = useCrud({
  crudApi: {
    list: (params: any) =>
      MemberAuthService.userListByTagId({ ...params, tag_id: record.value.id }),
  },
  hasAdd: false,
  hasEdit: false,
  hasRemove: false,
  hasBatchRemove: false,
  tableActionColumn: { width: '120px' },
  searchForm: {
    schema: [
      {
        fieldName: 'username',
        label: $t('member.tag.user.search.user_name'),
        component: 'Input',
        componentProps: {
          placeholder: $t('member.tag.user.search.placeholder.user_name'),
        },
      },
      {
        fieldName: 'nickname',
        label: $t('member.tag.user.search.real_name'),
        component: 'Input',
        componentProps: {
          placeholder: $t('member.tag.user.search.placeholder.real_name'),
        },
      },
    ],
  },
  columns: [
    { type: 'checkbox', width: 70 },
    {
      field: 'username',
      title: $t('member.tag.user.table.columns.user_name'),
      width: 150,
      align: 'left',
    },
    {
      field: 'nickname',
      title: $t('member.tag.user.table.columns.real_name'),
      align: 'left',
    },
    {
      field: 'phone',
      title: $t('member.tag.user.table.columns.mobile_phone'),
      align: 'center',
      formatter: ({ cellValue }: any) => cellValue || '/',
    },
  ],
  height: 'auto',
  toolbarActions: [
    {
      label: $t('member.tag.user.actions.add_user'),
      icon: 'ant-design:plus-outlined',
      type: 'primary',
      sort: -1,
      onClick: () => {
        addUserRef.value?.show({
          data: record.value,
          getCrudApi: () => crudApi,
        });
      },
    },
    {
      label: $t('member.tag.user.actions.remove_user'),
      type: 'danger',
      icon: 'ant-design:delete-outlined',
      sort: 100,
      confirm: {
        title: $t('member.tag.user.confirm.title'),
        content: $t('member.tag.user.confirm.content'),
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
      label: $t('member.tag.user.actions.remove_user'),
      type: 'danger',
      link: true,
      icon: 'ant-design:delete-outlined',
      confirm: {
        title: $t('member.tag.user.confirm.title'),
        content: $t('member.tag.user.confirm.content'),
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
      title: $t('member.tag.user.member_manage', { name: data.name }),
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
