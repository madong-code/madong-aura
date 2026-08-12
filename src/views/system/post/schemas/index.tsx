import type { CrudSchema } from '#/components/crud/components/types';

import { PostService } from '#/api/system/post';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: PostService.list,
      add: PostService.create,
      edit: PostService.update,
      remove: PostService.delete,
      batchRemove: PostService.remove,
      view: PostService.get,
    },

    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'org:post:create',
      edit: 'org:post:update',
      remove: 'org:post:delete',
      view: 'org:post:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'dept.name',
        title: $t('system.dept.table.columns.name'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'code',
        title: $t('system.post.table.columns.code'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'name',
        title: $t('system.post.table.columns.name'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'sort',
        title: $t('system.post.table.columns.sort'),
        minWidth: 80,
      },
      {
        field: 'enabled',
        title: $t('system.post.table.columns.enabled'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ENABLED_STATUS },
        },
      },
      {
        field: 'remark',
        title: $t('system.post.table.columns.remark'),
        minWidth: 160,
        align: 'left',
      },
    ],

    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'ApiTreeSelect',
          fieldName: 'EQ_dept_id',
          label: $t('system.post.form.dept_name'),
          componentProps: {
            clearable: true,
            checkStrictly: true,
            api: '/system/dept',
            params: { format: 'tree' },
            labelField: 'name',
            valueField: 'id',
            childrenField: 'children',
            placeholder: $t('system.post.form.placeholder.dept_name'),
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_code',
          label: $t('system.post.table.search.code'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.post.table.search.placeholder.code'),
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_name',
          label: $t('system.post.table.search.name'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.post.table.search.placeholder.name'),
          },
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_enabled',
          label: $t('system.post.table.search.enabled'),
          componentProps: {
            clearable: true,
            code: DictEnum.SYS_ENABLED_STATUS,
            placeholder: $t('system.post.table.search.placeholder.enabled'),
          },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t('system.post.title'),
      width: 'w-[50%]',
      wrapperClass: 'grid-cols-1',
      commonConfig: {
        labelWidth: 100,
        labelAlign: 'right',
      },
      schema: [
        {
          label: $t('system.post.form.id'),
          fieldName: 'id',
          component: 'Input',
          formItemClass: 'col-span-2',
          dependencies: { triggerFields: ['id'], show: false },
        },
        {
          label: $t('system.post.form.dept_name'),
          fieldName: 'dept_id',
          component: 'ApiTreeSelect',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            clearable: true,
            checkStrictly: true,
            api: '/system/dept',
            requestMethod: 'get',
            params: { format: 'tree' },
            labelField: 'name',
            valueField: 'id',
            childrenField: 'children',
            placeholder: $t('system.post.form.placeholder.dept_name'),
          },
        },
        {
          label: $t('system.post.form.name'),
          fieldName: 'name',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('system.post.form.placeholder.name'),
          },
        },
        {
          label: $t('system.post.form.code'),
          fieldName: 'code',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('system.post.form.placeholder.code'),
          },
        },
        {
          label: $t('system.post.form.sort'),
          fieldName: 'sort',
          component: 'InputNumber',
          defaultValue: 0,
          formItemClass: 'col-span-2',
          componentProps: { min: 0 },
        },
        {
          label: $t('system.post.form.enabled'),
          fieldName: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-2',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true,
            renderType: 'RadioGroup',
          },
        },
        {
          label: $t('system.post.form.remark'),
          fieldName: 'remark',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'textarea',
            placeholder: $t('system.post.form.placeholder.remark'),
          },
        },
      ],
    },
  };
};
