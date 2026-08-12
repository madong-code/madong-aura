<script setup lang="ts">
import { ref } from 'vue';

import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';
import { useVbenDrawer } from '#/core/ui/common';
import { $t } from '#/locales';

import { useCrudSchema } from '../dict-item/schemas';

const record = ref<any>(null);

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  class: 'w-[60%]',
});

const schema = useCrudSchema();
const [BasicCrud] = useCrud({
  ...schema,
  formDialog: {
    ...schema.formDialog,
    transformFormValues: (values, type) => {
      if (type === 'add') {
        values.dict_id = record.value?.id;
        values.code = record.value?.code;
      }
      return values;
    },
  },
  beforeFetch: (params) => ({
    ...params,
    dict_id: record.value?.id,
  }),
});

const show = (row: any) => {
  record.value = row;
  drawerApi.setState({
    title: `${$t('system.dict.item.title')} - ${row.name}`,
  });
  drawerApi.open();
};

defineExpose({ show });
</script>
<template>
  <Drawer>
    <Page auto-content-height>
      <BasicCrud v-if="record.id" />
    </Page>
  </Drawer>
</template>
