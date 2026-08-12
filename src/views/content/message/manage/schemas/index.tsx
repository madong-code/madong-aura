import type { CrudSchema } from '#/components/crud/components/types';

import { ManageService } from '#/api/content/message/manage';
import { $t } from '#/locales';

export function useCrudSchema(): CrudSchema {
  return {
    crudApi: {
      list: ManageService.list,
      add: ManageService.create,
      edit: ManageService.update as any,
      remove: ManageService.remove,
      batchRemove: ManageService.remove as any,
      view: ManageService.get,
    },
    rowKey: 'id',
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    hasBatchRemove: true,
    checkable: true,
    border: 'none' as any,
    stripe: true,
    pagerConfig: { enabled: true, pageSize: 15 },
    permissions: {
      add: 'content:message:manage:create',
      edit: 'content:message:manage:update',
      remove: 'content:message:manage:delete',
      view: 'content:message:manage:read',
    },
    searchForm: {
      enabled: true,
      submitOnChange: true,
      schema: [
        {
          fieldName: 'LIKE_name',
          label: $t('content.message.manage.table.search.name'),
          component: 'Input',
        },
        {
          fieldName: 'EQ_is_enabled',
          label: $t('content.message.manage.table.search.is_enabled'),
          component: 'Select',
          componentProps: {
            clearable: true,
            options: [
              {
                label: $t('content.message.manage.table.isEnabledOptions.1'),
                value: 1,
              },
              {
                label: $t('content.message.manage.table.isEnabledOptions.0'),
                value: 0,
              },
            ],
          },
        },
      ],
    },
    toolbar: {
      refresh: false,
      custom: false,
      zoom: false,
      export: false,
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'name',
        title: $t('content.message.manage.table.columns.name'),
        minWidth: 150,
        align: 'left',
      },
      {
        field: 'key',
        title: $t('content.message.manage.table.columns.key'),
        width: 140,
      },
      {
        field: 'category_name',
        title: $t('content.message.manage.table.columns.category_name'),
        width: 120,
      },
      {
        field: 'is_enabled',
        title: $t('content.message.manage.table.columns.is_enabled'),
        width: 80,
        formatter: ({ cellValue }: any) => {
          return cellValue
            ? $t('content.message.manage.table.isEnabledOptions.1')
            : $t('content.message.manage.table.isEnabledOptions.0');
        },
      },
      {
        field: 'sort',
        title: $t('content.message.manage.table.columns.sort'),
        width: 80,
      },
    ],
    formDialog: {
      enabled: true,
      title: $t('content.message.manage.form.dialog_title'),
      width: 'w-[55%]',
      wrapperClass: 'grid-cols-2',
      commonConfig: { labelWidth: 100, labelAlign: 'right' },
      schema: [
        {
          fieldName: 'name',
          label: $t('content.message.manage.form.name'),
          component: 'Input',
          rules: 'required',
        },
        {
          fieldName: 'key',
          label: $t('content.message.manage.form.key'),
          component: 'Input',
          rules: 'required',
        },
        {
          fieldName: 'category_id',
          label: $t('content.message.manage.form.category_id'),
          component: 'Input',
        },
        {
          fieldName: 'sort',
          label: $t('content.message.manage.form.sort'),
          component: 'InputNumber',
          defaultValue: 0,
        },
        {
          fieldName: 'is_enabled',
          label: $t('content.message.manage.form.is_enabled'),
          component: 'Select',
          defaultValue: 1,
          componentProps: {
            options: [
              {
                label: $t('content.message.manage.table.isEnabledOptions.1'),
                value: 1,
              },
              {
                label: $t('content.message.manage.table.isEnabledOptions.0'),
                value: 0,
              },
            ],
          },
        },
        {
          fieldName: 'default_on',
          label: $t('content.message.manage.form.default_on'),
          component: 'Select',
          defaultValue: 1,
          componentProps: {
            options: [
              {
                label: $t('content.message.manage.form.default_on_options.1'),
                value: 1,
              },
              {
                label: $t('content.message.manage.form.default_on_options.0'),
                value: 0,
              },
            ],
          },
        },
        {
          fieldName: 'nav_type',
          label: $t('content.message.manage.form.nav_type'),
          component: 'Select',
          componentProps: {
            clearable: true,
            options: [
              {
                label: $t(
                  'content.message.manage.form.nav_type_options.router',
                ),
                value: 'router',
              },
              {
                label: $t('content.message.manage.form.nav_type_options.url'),
                value: 'url',
              },
              {
                label: $t('content.message.manage.form.nav_type_options.none'),
                value: 'none',
              },
            ],
          },
        },
        {
          fieldName: 'nav_value',
          label: $t('content.message.manage.form.nav_value'),
          component: 'Input',
          dependencies: {
            triggerFields: ['nav_type'],
            show: (form: any) => !!form.nav_type && form.nav_type !== 'none',
          },
        },
        {
          fieldName: 'description',
          label: $t('content.message.manage.form.description'),
          component: 'Textarea',
          componentProps: { rows: 2 },
          formItemClass: 'col-span-2',
        },
      ],
    },
  };
}
