<script setup lang="ts">
import type { CrudSchema } from '#/adapter/crud';

import { ref } from 'vue';

import { ElMessage, ElMessageBox } from 'element-plus';

import { useCrud } from '#/adapter/crud';
import { ConfigService } from '#/api/system/config';
import { Page } from '#/components/page';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

import ConfigDialog from './config-dialog.vue';

const configDialogRef = ref<InstanceType<typeof ConfigDialog>>();

const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: (params: any) =>
        ConfigService.getItems({ ...params, groupCode: 'default' }),
      add: (params: any) => {
        const { group_code, code, name, content, remark } = params;
        return ConfigService.save({ group_code, code, name, content, remark });
      },
      edit: (params: any) => {
        const { group_code, code, name, content, remark, enabled } = params;
        return ConfigService.update(code, {
          group_code,
          code,
          name,
          content,
          remark,
          enabled,
        });
      },
      remove: (params: any) => {
        const codes = params.codes || params.code;
        if (Array.isArray(codes)) {
          return Promise.all(codes.map((c: string) => ConfigService.delete(c)));
        }
        return ConfigService.delete(codes);
      },
      batchRemove: () => Promise.resolve(),
      view: ConfigService.getByCode as any,
    },

    rowKey: 'code',
    hasAdd: false,
    hasEdit: false,
    hasView: false,
    hasRemove: false,
    height: 'auto',
    columns: [
      {
        field: 'name',
        title: $t('system.config.common.columns.name'),
        width: 180,
      },
      {
        field: 'code',
        title: $t('system.config.common.columns.code'),
        width: 200,
      },
      {
        field: 'content',
        title: $t('system.config.common.columns.content'),
        minWidth: 250,
      },
      {
        field: 'enabled',
        title: $t('system.config.common.columns.enabled'),
        width: 80,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.SYS_ENABLED_STATUS },
      },
      {
        field: 'updated_at',
        title: $t('system.config.common.columns.updated_at'),
        minWidth: 170,
        formatter: 'formatDateTime',
      },
    ],

    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'Input',
          fieldName: 'keyword',
          label: $t('common.action.search'),
          hideLabel: true,
          componentProps: {
            placeholder: $t('system.config.common.search.keyword'),
          },
        },
      ],
    },

    formDialog: {
      enabled: false,
    },

    toolbarActions: [
      {
        label: $t('common.crud.create'),
        type: 'primary',
        icon: 'ant-design:plus-outlined',
        dialogRef: configDialogRef,
        dialogParams() {
          return {
            isEdit: false,
            getCrudApi() {
              return crudApi;
            },
          };
        },
      },
    ],
    tableActions: [
      {
        label: $t('common.crud.edit'),
        type: 'primary',
        sort: 10,
        link: true,
        icon: 'ant-design:edit-outlined',
        dialogRef: configDialogRef,
        dialogParams(record: any) {
          return {
            data: record,
            isEdit: true,
            getCrudApi() {
              return crudApi;
            },
          };
        },
      },
      {
        label: $t('common.crud.delete'),
        type: 'danger',
        sort: 50,
        link: true,
        icon: 'ant-design:delete-outlined',
        onClick: (_event: Event, record: any) => {
          ElMessageBox.confirm(
            $t('common.confirm_dialog.delete'),
            $t('common.message.tips'),
            { type: 'warning' },
          )
            .then(() => {
              ConfigService.delete(record.code)
                .then(() => {
                  ElMessage.success($t('system.config.save_success'));
                  crudApi.refreshRemove();
                })
                .catch(() => {
                  ElMessage.error($t('common.message.fail'));
                });
            })
            .catch(() => {});
        },
      },
    ],
  };
};

const [BasicCrud, crudApi] = useCrud(useCrudSchema());
</script>

<template>
  <Page auto-content-height>
    <BasicCrud />
    <ConfigDialog ref="configDialogRef" />
  </Page>
</template>
