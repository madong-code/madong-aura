<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { ElMessage } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { GeneratorCodeService } from '#/api/app/plugin/codegen';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import CodePreview from './components/code-preview.vue';
import ImportTable from './components/import-table.vue';
import { useCrudSchema } from './schemas';

defineOptions({ name: 'CodegenGenerate' });

const router = useRouter();
const importTableRef = ref();
const codePreviewRef = ref();

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const download = async (id: number | string) => {
  const response = await GeneratorCodeService.download(id);
  if (response) {
    downloadFile(response, 'codegen.zip');
    ElMessage.success($t('codegen.generate.action.download_success'));
  } else {
    ElMessage.error($t('codegen.generate.action.download_fail'));
  }
};

const [BasicCrud, crudApi] = useCrud({
  ...useCrudSchema(),
  toolbarActions: [
    {
      label: $t('codegen.generate.action.import_table'),
      type: 'primary',
      sort: 1010,
      icon: 'ant-design:plus-outlined',
      dialogRef: importTableRef,
    },
    {
      key: 'batchRemove',
      label: $t('components.crud.action.batch_delete'),
      type: 'danger',
      sort: 1020,
      icon: 'ant-design:delete-outlined',
      auth: 'generator:code:delete',
      ifShow: () => crudApi.getRowSelection().length > 0,
      onClick: () => {
        crudApi.executeBatchRemove();
      },
    },
  ],
  dropDownToolbarActions: [],
  tableActions: [
    {
      label: $t('codegen.generate.action.edit'),
      type: 'primary',
      sort: 1010,
      link: true,
      icon: 'ant-design:edit-outlined',
      auth: 'generator:code:update',
      onClick: (_e: Event, row: any) => {
        router.push({ path: '/codegen/generator', query: { id: row.id } });
      },
    },
  ],
  dropDownActions: [
    {
      key: 'remove',
      label: $t('components.crud.action.delete'),
      type: 'danger',
      icon: 'ant-design:delete-outlined',
      auth: 'generator:code:delete',
      onClick: (_e: Event, row: any) => {
        crudApi.executeRemove(row);
      },
    },
    {
      label: $t('codegen.generate.action.preview'),
      sort: 1010,
      link: true,
      icon: 'ant-design:eye-outlined',
      auth: 'generator:code:preview',
      dialogRef: codePreviewRef,
      dialogParams: (record: any) => ({ record }),
    },
    {
      label: $t('codegen.generate.action.deploy'),
      sort: 1020,
      link: true,
      icon: 'ant-design:cloud-upload-outlined',
      auth: 'generator:code:deploy',
      onClick: async (_e: Event, row: any) => {
        await GeneratorCodeService.deploy(row.id);
        crudApi.reload();
      },
    },
    {
      label: $t('codegen.generate.action.download'),
      sort: 1030,
      link: true,
      icon: 'ant-design:download-outlined',
      auth: 'generator:code:download',
      onClick: async (_e: Event, row: any) => {
        download(row.id);
      },
    },
  ],
});
</script>

<template>
  <Page auto-content-height>
    <BasicCrud />
    <ImportTable ref="importTableRef" @success="crudApi.reload()" />
    <CodePreview ref="codePreviewRef" />
  </Page>
</template>
