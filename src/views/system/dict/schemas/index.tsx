import type { CrudSchema } from '#/components/crud/components/types';

import { DictService } from '#/api/system/dict';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: DictService.list,
      add: DictService.create,
      edit: DictService.update,
      remove: DictService.delete,
      batchRemove: DictService.remove,
      view: DictService.detail,
    },

    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'dict:dict:create',
      edit: 'dict:dict:update',
      remove: 'dict:dict:delete',
      view: 'dict:dict:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'group_code',
        title: $t('system.dict.table.columns.group_code'),
        minWidth: 200,
        align: 'left',
      },
      {
        field: 'name',
        title: $t('system.dict.table.columns.name'),
        minWidth: 200,
        align: 'left',
      },
      {
        field: 'code',
        title: $t('system.dict.table.columns.code'),
        minWidth: 200,
        align: 'left',
      },
      {
        field: 'data_type',
        title: $t('system.dict.table.columns.data_type'),
        minWidth: 100,
        align: 'left',
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.SYS_DICT_DATA_TYPE },
      },
      {
        field: 'sort',
        title: $t('system.dict.table.columns.sort'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'enabled',
        title: $t('system.dict.table.columns.enabled'),
        minWidth: 100,
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
          component: 'ApiDict',
          fieldName: 'IN_groupCode',
          label: $t('system.dict.table.search.group_code'),
          componentProps: {
            code: DictEnum.SYS_DICT_GROUP_CODE,
            clearable: true,
            placeholder: $t('system.dict.table.search.placeholder.group_code'),
            multiple: true,
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_name',
          label: $t('system.dict.table.search.name'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.dict.table.search.placeholder.name'),
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_code',
          label: $t('system.dict.table.search.code'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.dict.table.search.placeholder.code'),
          },
        },
        {
          component: 'ApiDict',
          fieldName: 'IN_enabled',
          label: $t('system.dict.table.search.enabled'),
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true,
            placeholder: $t('system.dict.table.search.placeholder.enabled'),
          },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t('system.dict.title'),
      width: 'w-[50%]',
      wrapperClass: 'grid-cols-1',
      commonConfig: {
        labelWidth: 100,
        labelAlign: 'right',
      },
      schema: [
        {
          label: $t('system.dict.form.modal.id'),
          fieldName: 'id',
          component: 'Input',
          formItemClass: 'col-span-2',
          dependencies: { triggerFields: ['id'], show: false },
        },
        {
          label: $t('system.dict.form.modal.group_code'),
          fieldName: 'group_code',
          component: 'ApiDict',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: { code: DictEnum.SYS_DICT_GROUP_CODE },
        },
        {
          label: $t('system.dict.form.modal.name'),
          fieldName: 'name',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('system.dict.form.modal.placeholder.name'),
          },
        },
        {
          label: $t('system.dict.form.modal.code'),
          fieldName: 'code',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('system.dict.form.modal.placeholder.code'),
          },
        },
        {
          label: $t('system.dict.form.modal.data_type'),
          fieldName: 'data_type',
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-2',
          componentProps: {
            code: DictEnum.SYS_DICT_DATA_TYPE,
            renderType: 'RadioGroup',
            isBtn: true,
          },
        },
        {
          label: $t('system.dict.form.modal.enabled'),
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
          label: $t('system.dict.form.modal.sort'),
          fieldName: 'sort',
          component: 'InputNumber',
          defaultValue: 0,
          formItemClass: 'col-span-2',
        },
        {
          label: $t('system.dict.form.modal.remark'),
          fieldName: 'remark',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t('system.dict.form.modal.placeholder.remark'),
          },
        },
      ],
    },
  };
};
