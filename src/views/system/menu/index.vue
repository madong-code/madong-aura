<script setup lang="ts">
import { ref } from 'vue';

import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';

import InterfaceListSelector from './initerface-list.vue';
import { useCrudSchema } from './schemas';

const [BasicCrud, crudApi] = useCrud({
  ...useCrudSchema(),
  dropDownActions: [
    {
      label: '选择权限',
      type: 'primary',
      link: true,
      auth: 'system:menu:batch_store',
      icon: 'ant-design:link-outlined',
      onClick: (_e: any, row: any) => {
        interfaceListSelectorRef.value?.show({
          data: row,
          getCrudApi: () => crudApi,
        });
      },
    },
  ],
});
const interfaceListSelectorRef = ref();
</script>

<template>
  <Page auto-content-height>
    <BasicCrud />
    <InterfaceListSelector
      ref="interfaceListSelectorRef"
      @success="crudApi?.refreshCreate()"
    />
  </Page>
</template>
