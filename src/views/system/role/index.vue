<script setup lang="ts">
import { ref } from 'vue';

import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import AuthMenu from './components/auth-menu.vue';
import DataScope from './components/data-scope.vue';
import UserRole from './components/user-role.vue';
import { useCrudSchema } from './schemas';

const authMenuRef = ref();
const userRoleRef = ref();
const dataScopeRef = ref();

const [BasicCrud, crudApi] = useCrud({
  ...useCrudSchema(),
  tableActionColumn: {
    width: 320,
  },
  tableActions: [
    {
      label: $t('system.role.table_actions.auth_menu'),
      type: 'primary',
      link: true,
      auth: 'system:auth:role_menu',
      icon: 'ant-design:safety-certificate-outlined',
      onClick: (_e: any, row: any) => {
        authMenuRef.value?.show({
          data: row,
          getCrudApi: () => crudApi,
        });
      },
    },
    {
      label: $t('system.role.table_actions.member_manage'),
      type: 'primary',
      link: true,
      auth: 'system:auth:role_user_list',
      icon: 'ant-design:team-outlined',
      onClick: (_e: any, row: any) => {
        userRoleRef.value?.show({
          data: row,
          getCrudApi: () => crudApi,
        });
      },
    },
  ],
  dropDownActions: [
    {
      label: $t('system.role.drop_down_actions.edit'),
      auth: 'system:role:update',
      icon: 'ant-design:edit-outlined',
      onClick: (_e: any, row: any) => {
        crudApi.openEditDialog(row);
      },
    },
    {
      label: $t('system.role.drop_down_actions.assign_permission'),
      auth: 'system:role:data_scope',
      icon: 'ant-design:safety-outlined',
      onClick: (_e: any, row: any) => {
        dataScopeRef.value?.show({
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
    <UserRole ref="userRoleRef" />
    <DataScope ref="dataScopeRef" @success="crudApi?.refreshCreate()" />
  </Page>
</template>
