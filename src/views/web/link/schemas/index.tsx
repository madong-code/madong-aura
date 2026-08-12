import type { CrudSchema } from '#/components/crud/components/types';

import { LinkService } from '#/api/web';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: LinkService.list,
      add: LinkService.create,
      edit: LinkService.update,
      remove: LinkService.delete,
      batchRemove: LinkService.remove,
      view: LinkService.get,
    },

    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: true,
    hasView: false,
    hasRemove: true,
    permissions: {
      add: 'web:link:create',
      edit: 'web:link:update',
      remove: 'web:link:delete',
      view: 'web:link:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      { field: 'logo', title: $t('web.link.table.columns.logo'), width: 80 },
      {
        field: 'name',
        title: $t('web.link.table.columns.name'),
        minWidth: 120,
      },
      { field: 'url', title: $t('web.link.table.columns.url'), minWidth: 200 },
      {
        field: 'description',
        title: $t('web.link.table.columns.description'),
        minWidth: 150,
      },
      { field: 'sort', title: $t('web.link.table.columns.sort'), minWidth: 80 },
      {
        field: 'enabled',
        title: $t('web.link.table.columns.enabled'),
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
          component: 'Input',
          fieldName: 'LIKE_name',
          label: $t('web.link.table.search.name'),
        },
        {
          component: 'Input',
          fieldName: 'LIKE_url',
          label: $t('web.link.table.search.url'),
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_enabled',
          label: $t('web.link.table.search.enabled'),
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true,
          },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t('web.link.title'),
      width: 'w-[500px]',
      wrapperClass: 'grid-cols-1',
      commonConfig: { labelWidth: 120 },
      schema: [
        {
          fieldName: 'id',
          label: 'ID',
          component: 'Input',
          dependencies: { triggerFields: ['id'], show: false },
        },
        {
          fieldName: 'name',
          label: $t('web.link.form.name'),
          component: 'Input',
          rules: 'required',
        },
        {
          fieldName: 'url',
          label: $t('web.link.form.url'),
          component: 'Input',
          rules: 'required',
        },
        {
          fieldName: 'logo',
          label: $t('web.link.form.logo'),
          component: 'Avatar',
        },
        {
          fieldName: 'sort',
          label: $t('web.link.form.sort'),
          component: 'InputNumber',
          componentProps: { min: 0 },
        },
        {
          fieldName: 'enabled',
          label: $t('web.link.form.enabled'),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true,
            renderType: 'RadioGroup',
          },
        },
        {
          fieldName: 'description',
          label: $t('web.link.form.description'),
          component: 'Input',
          componentProps: { type: 'textarea', rows: 4 },
        },
      ],
    },
  };
};
