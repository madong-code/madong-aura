<script setup lang="ts">
import { ref } from 'vue';

import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import DictItemWrap from './dict-item-wrap.vue';
import { useCrudSchema } from './schemas';

const dictItemWrapRef = ref();

const [BasicCrud, crudApi] = useCrud({
  ...useCrudSchema(),
  hasEdit: false,
  hasRemove: false,
  tableActions: [
    {
      label: $t('system.dict.table_actions.dict_item'),
      type: 'primary',
      link: true,
      icon: 'ant-design:setting-outlined',
      auth: 'dict:item:read',
      onClick: (_action: any, row: any) => {
        dictItemWrapRef.value?.show(row);
      },
    },
  ],
  dropDownActions: [
    {
      label: $t('system.dict.drop_down_actions.edit'),
      type: 'primary',
      link: true,
      icon: 'ant-design:edit-outlined',
      auth: 'dict:dict:update',
      onClick: (_action: any, row: any) => {
        crudApi.openEditDialog(row);
      },
    },
    {
      label: $t('system.dict.drop_down_actions.delete'),
      type: 'danger',
      icon: 'ant-design:delete-outlined',
      auth: 'dict:dict:delete',
      onClick: (_action: any, _record: any) => {
        crudApi.executeRemove(_record);
      },
    },
  ],
});
</script>

<template>
  <Page auto-content-height>
    <BasicCrud />
    <DictItemWrap ref="dictItemWrapRef" />
  </Page>
</template>
