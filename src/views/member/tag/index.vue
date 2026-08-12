<script setup lang="ts">
import { ref } from 'vue';

import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import AuthMenu from './components/auth-menu.vue';
import UserTag from './components/user-tag.vue';
import { useCrudSchema } from './schemas';

const authMenuRef = ref();
const userTagRef = ref();

const [BasicCrud, crudApi] = useCrud({
  ...useCrudSchema(),
  tableActionColumn: {
    width: 320,
  },
  dropDownActions: [
    {
      label: $t('common.crud.edit'),
      auth: 'member:tag:update',
      icon: 'ant-design:edit-outlined',
      onClick: (_e: any, row: any) => {
        crudApi.openEditDialog(row);
      },
    },
  ],
  tableActions: [
    {
      label: $t('member.tag.table_actions.auth_menu'),
      type: 'primary',
      link: true,
      auth: 'member:tag:assign_permissions',
      icon: 'ant-design:setting-outlined',
      onClick: (_e: any, row: any) => {
        authMenuRef.value?.show({
          data: row,
          getCrudApi: () => crudApi,
        });
      },
    },
    {
      label: $t('member.tag.table_actions.member_manage'),
      type: 'primary',
      link: true,
      auth: 'member:tag:member_list',
      icon: 'ant-design:team-outlined',
      onClick: (_e: any, row: any) => {
        userTagRef.value?.show({
          data: row,
          getCrudApi: () => crudApi,
        });
      },
    },
  ],
});
</script>

<template>
  <Page auto-content-height>
    <BasicCrud />
    <AuthMenu ref="authMenuRef" @success="crudApi?.refreshCreate()" />
    <UserTag ref="userTagRef" />
  </Page>
</template>
