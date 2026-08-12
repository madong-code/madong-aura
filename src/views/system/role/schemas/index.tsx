import type { CrudSchema } from '#/components/crud/components/types';

import { RoleService } from '#/api/system';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: RoleService.list,
      add: RoleService.create,
      edit: RoleService.update,
      remove: RoleService.delete,
      batchRemove: RoleService.remove,
      view: RoleService.get,
    },

    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: false,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'system:role:create',
      edit: 'system:role:update',
      remove: 'system:role:delete',
      view: 'system:role:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'id',
        title: $t('system.role.table.columns.id'),
        minWidth: 60,
        visible: false,
      },
      {
        field: 'name',
        title: $t('system.role.table.columns.name'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'code',
        title: $t('system.role.table.columns.code'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'role_type',
        title: $t('system.role.table.columns.role_type'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ROLE_TYPE },
        },
      },
      {
        field: 'data_scope',
        title: $t('system.role.table.columns.data_scope'),
        minWidth: 100,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_DATA_PERMISSION },
        },
      },
      {
        field: 'enabled',
        title: $t('system.role.table.columns.enabled'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ENABLED_STATUS },
        },
      },
      {
        field: 'sort',
        title: $t('system.role.table.columns.sort'),
        minWidth: 60,
      },
      {
        field: 'remark',
        title: $t('system.role.table.columns.remark'),
        minWidth: 160,
        align: 'left',
        visible: false,
      },
      {
        field: 'created_at',
        title: $t('system.role.table.columns.created_at'),
        formatter: 'formatDateTime',
        minWidth: 160,
        visible: false,
      },
      {
        field: 'updated_at',
        title: $t('system.role.table.columns.updated_at'),
        formatter: 'formatDateTime',
        minWidth: 160,
        visible: false,
      },
    ],

    // 搜索表单配置
    searchForm: {
      enabled: true,
      schema: [
        {
          fieldName: 'LIKE_name',
          label: $t('system.role.search.name'),
          component: 'Input',
        },
        {
          fieldName: 'LIKE_code',
          label: $t('system.role.search.code'),
          component: 'Input',
        },
        {
          fieldName: 'LIKE_enabled',
          label: $t('system.role.search.enabled'),
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true,
          },
        },
      ],
    },

    // 表单弹窗配置
    formDialog: {
      enabled: true,
      dialogType: 'modal',

      schema: [
        {
          fieldName: 'id',
          label: $t('system.role.form.id'),
          component: 'Input',
          dependencies: { triggerFields: ['id'], show: false },
        },
        {
          fieldName: 'name',
          label: $t('system.role.form.name'),
          component: 'Input',
          rules: 'required',
        },
        {
          fieldName: 'code',
          label: $t('system.role.form.code'),
          component: 'Input',
          rules: 'required',
        },
        {
          fieldName: 'role_type',
          label: $t('system.role.form.role_type'),
          component: 'ApiDict',
          componentProps: { code: DictEnum.SYS_ROLE_TYPE, clearable: true },
        },
        {
          fieldName: 'enabled',
          label: $t('system.role.form.enabled'),
          component: 'ApiDict',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            renderType: 'RadioGroup',
            isBtn: true,
          },
          defaultValue: 1,
          formItemClass: 'cols-span-6',
        },
        {
          fieldName: 'remark',
          label: $t('system.role.form.remark'),
          component: 'Input',
          componentProps: { type: 'textarea', rows: 3 },
          formItemClass: 'cols-span-6',
        },
      ],
      title: $t('system.role.title'),
      width: 'w-[40%]',
      wrapperClass: 'grid-cols-1',
      commonConfig: {
        labelWidth: 80,
        labelAlign: 'right',
      },
    },
  };
};
