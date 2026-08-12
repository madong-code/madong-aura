import type { CrudSchema } from '#/components/crud/components/types';

import { DictItemService } from '#/api/system/dict';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: DictItemService.list,
      add: DictItemService.create,
      edit: DictItemService.update,
      remove: DictItemService.delete,
      batchRemove: DictItemService.remove,
      view: DictItemService.get,
    },

    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'dict:item:create',
      edit: 'dict:item:update',
      remove: 'dict:item:delete',
      view: 'dict:item:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'code',
        title: $t('system.dict.item.table.columns.code'),
        minWidth: 150,
      },
      {
        field: 'label',
        title: $t('system.dict.item.table.columns.label'),
        minWidth: 120,
      },
      {
        field: 'value',
        title: $t('system.dict.item.table.columns.value'),
        minWidth: 120,
      },
      {
        field: 'sort',
        title: $t('system.dict.item.table.columns.sort'),
        minWidth: 80,
      },
      {
        field: 'enabled',
        title: $t('system.dict.item.table.columns.enabled'),
        minWidth: 80,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.SYS_ENABLED_STATUS },
      },
    ],

    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'Input',
          fieldName: 'LIKE_label',
          label: $t('system.dict.item.table.search.label'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.dict.item.table.search.placeholder.label'),
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_value',
          label: $t('system.dict.item.table.search.value'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.dict.item.table.search.placeholder.value'),
          },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t('system.dict.item.title'),
      width: 'w-[50%]',
      wrapperClass: 'grid-cols-1',
      commonConfig: {
        labelWidth: 100,
        labelAlign: 'right',
      },
      schema: [
        {
          label: $t('system.dict.item.form.modal.id'),
          fieldName: 'id',
          component: 'Input',
          formItemClass: 'col-span-2',
          dependencies: { triggerFields: ['id'], show: false },
        },
        {
          label: $t('system.dict.item.form.modal.id'),
          fieldName: 'dict_id',
          component: 'Input',
          formItemClass: 'col-span-2',
          dependencies: { triggerFields: ['dict_id'], show: false },
        },
        {
          label: $t('system.dict.item.form.modal.code'),
          fieldName: 'code',
          component: 'Input',
          formItemClass: 'col-span-2',
          dependencies: { triggerFields: ['dict_id'], show: false },
        },
        {
          label: $t('system.dict.item.form.modal.color'),
          fieldName: 'color',
          component: 'Input',
          formItemClass: 'col-span-2',
        },
        {
          label: $t('system.dict.item.form.modal.label'),
          fieldName: 'label',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('system.dict.item.form.modal.placeholder.label'),
          },
        },
        {
          label: $t('system.dict.item.form.modal.value'),
          fieldName: 'value',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('system.dict.item.form.modal.placeholder.value'),
          },
        },
        {
          label: $t('system.dict.item.form.modal.other_class'),
          fieldName: 'other_class',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t(
              'system.dict.item.form.modal.placeholder.other_class',
            ),
          },
        },
        {
          label: $t('system.dict.item.form.modal.enabled'),
          fieldName: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-2',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            renderType: 'RadioGroup',
            isBtn: true,
          },
        },
        {
          label: $t('system.dict.item.form.modal.sort'),
          fieldName: 'sort',
          component: 'InputNumber',
          defaultValue: 0,
          formItemClass: 'col-span-2',
          componentProps: { min: 0 },
        },
        {
          label: $t('system.dict.item.form.modal.remark'),
          fieldName: 'remark',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t('system.dict.item.form.modal.placeholder.remark'),
          },
        },
      ],
    },
  };
};
