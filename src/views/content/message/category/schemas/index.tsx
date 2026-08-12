import type { CrudSchema } from '#/components/crud/components/types';

import { h } from 'vue';

import { CategoryService } from '#/api/content/message/category';
import { Icon } from '#/components/icon';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export function useCrudSchema(): CrudSchema {
  return {
    crudApi: {
      list: CategoryService.list,
      add: CategoryService.create,
      edit: CategoryService.update as any,
      remove: CategoryService.delete as any,
      batchRemove: CategoryService.remove as any,
      view: CategoryService.get,
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
      add: 'message:category:create',
      edit: 'message:category:update',
      remove: 'message:category:delete',
      view: 'message:category:read',
    },
    searchForm: {
      enabled: true,
      submitOnChange: true,
      schema: [
        {
          fieldName: 'LIKE_name',
          label: $t('content.message.category.table.search.name'),
          component: 'Input',
        },
      ],
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'icon',
        title: $t('content.message.category.table.columns.icon'),
        width: 100,
        slots: {
          default: ({ row }: any) =>
            row.icon ? h(Icon, { icon: row.icon }) : null,
        },
      },
      {
        field: 'key',
        title: $t('content.message.category.table.columns.key'),
        width: 200,
        align: 'left',
      },
      {
        field: 'name',
        title: $t('content.message.category.table.columns.name'),
        minWidth: 150,
        align: 'left',
      },
      {
        field: 'sort',
        title: $t('content.message.category.table.columns.sort'),
        width: 80,
      },
      {
        field: 'enabled',
        title: $t('content.message.category.table.columns.is_enabled'),
        width: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: {
            code: DictEnum.SYS_ENABLED_STATUS,
          },
        },
      },
    ],
    formDialog: {
      enabled: true,
      title: $t('content.message.category.form.dialog_title'),
      width: 'w-[55%]',
      wrapperClass: 'grid-cols-2 gap-x-4',
      commonConfig: {
        labelWidth: 100,
        labelAlign: 'right',
      },
      schema: [
        {
          fieldName: 'id',
          label: $t('content.message.category.form.id'),
          component: 'Input',
          dependencies: {
            triggerFields: ['id'],
            show: false,
          },
        },
        {
          fieldName: 'key',
          label: $t('content.message.category.form.key'),
          component: 'Input',
          rules: 'required',
        },
        {
          fieldName: 'name',
          label: $t('content.message.category.form.name'),
          component: 'Input',
          rules: 'required',
        },
        {
          fieldName: 'icon',
          label: $t('content.message.category.form.icon'),
          component: 'IconPicker',
        },
        {
          fieldName: 'sort',
          label: $t('content.message.category.form.sort'),
          component: 'InputNumber',
          defaultValue: 0,
        },
        {
          fieldName: 'enabled',
          label: $t('content.message.category.form.is_enabled'),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            renderType: 'RadioGroup',
            isBtn: true,
          },
        },
        {
          fieldName: 'description',
          label: $t('content.message.category.form.description'),
          component: 'Textarea',
          componentProps: { rows: 4 },
          formItemClass: 'col-span-2',
        },
      ],
    },
  };
}
