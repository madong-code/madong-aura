<script setup lang="ts">
import type { CrudSchema } from '#/components/crud/components/types';

import { ref } from 'vue';

import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import TemplateSelector from './components/template-selector.vue';
import { useCrudSchema } from './schemas';

// ---- 模板关联弹窗 ----
const templateSelectorRef = ref<InstanceType<typeof TemplateSelector>>();

function openTemplateDialog(row: any) {
  const defName = row.name || row.definition_name || '';
  templateSelectorRef.value?.open(row.id, defName);
}

// ---- CRUD 配置 ----
const crudConfig: CrudSchema = {
  ...useCrudSchema(),

  tableActionColumn: {
    width: 220,
  },
  dropDownActions: [
    {
      label: $t('content.message.manage.drop_down.link_template'),
      icon: 'ant-design:link-outlined',
      auth: 'message:manage:update',
      onClick: (_e: any, row: any) => {
        openTemplateDialog(row);
      },
    },
  ],
};

const [BasicCrud] = useCrud(crudConfig);
</script>

<template>
  <Page auto-content-height>
    <BasicCrud />

    <TemplateSelector ref="templateSelectorRef" />
  </Page>
</template>
