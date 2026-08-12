<script setup lang="ts">
import type { CrudApiInstance } from '#/adapter/crud';

import { ref } from 'vue';

import { ElMessage } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { MemberAuthService } from '#/api/member/auth';
import { useDialog } from '#/components/dialog';
import { $t } from '#/locales';

const record = ref<any>({});
const parentCrudApi = ref<CrudApiInstance>();

const [Dialog, dialogApi] = useDialog({
  title: $t('member.tag.user.add_title'),
  width: '60%',
  modal: true,
  draggable: true,
  destroyOnClose: true,
  onConfirm: () => {
    const selection = crudApi.getRowSelection();
    if (selection.length === 0) {
      ElMessage.warning($t('member.tag.user.message.select_user'));
      return;
    }
    dialogApi.setState({ confirmLoading: true, loading: true });
    MemberAuthService.saveUserTag(
      selection.map((item: any) => ({
        tag_id: record.value.id,
        member_id: item.id,
      })),
    )
      .then(() => {
        ElMessage.success($t('member.tag.user.message.save_success'));
        crudApi.refreshRemove();
        parentCrudApi.value?.refreshCreate();
        dialogApi.close();
      })
      .finally(() => {
        dialogApi.setState({ confirmLoading: false, loading: false });
      });
  },
});

const [BasicCrud, crudApi] = useCrud({
  crudApi: {
    list: (params: any) =>
      MemberAuthService.userListExcludeTagId({
        ...params,
        tag_id: record.value.id,
      }),
  },
  hasAdd: false,
  hasEdit: false,
  hasRemove: false,
  hasBatchRemove: false,
  height: '500px',
  searchForm: {
    schema: [
      {
        fieldName: 'username',
        label: $t('member.tag.user.search.user_name'),
        component: 'Input',
        componentProps: {
          placeholder: $t('member.tag.user.search.placeholder.user_name'),
        },
        colSpan: 8,
      },
      {
        fieldName: 'nickname',
        label: $t('member.tag.user.search.real_name'),
        component: 'Input',
        componentProps: {
          placeholder: $t('member.tag.user.search.placeholder.real_name'),
        },
        colSpan: 8,
      },
    ],
  },
  columns: [
    { type: 'checkbox', width: 50 },
    {
      field: 'username',
      title: $t('member.tag.user.table.columns.user_name'),
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
    },
  ],
} as any);

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
    <BasicCrud />
  </Dialog>
</template>
