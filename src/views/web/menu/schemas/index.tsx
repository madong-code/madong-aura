import type { CrudSchema } from '#/components/crud/components/types';

import { WebMenuService } from '#/api/web';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

function arrayToTree(
  data: any[],
  idKey = 'id',
  pidKey = 'pid',
  childrenKey = 'children',
): any[] {
  const map = new Map<any, any>();
  const roots: any[] = [];
  data.forEach((item) => map.set(item[idKey], { ...item, [childrenKey]: [] }));
  data.forEach((item) => {
    const node = map.get(item[idKey]);
    if (item[pidKey]) {
      const p = map.get(item[pidKey]);
      p ? p[childrenKey].push(node) : roots.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: WebMenuService.list,
      add: WebMenuService.create,
      edit: WebMenuService.update,
      remove: WebMenuService.delete,
      batchRemove: WebMenuService.remove,
      view: WebMenuService.get,
    },

    // ========== 扁平化表格配置 ==========
    rowKey: 'id',
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'web:menu:create',
      edit: 'web:menu:update',
      remove: 'web:menu:delete',
      view: 'web:menu:read',
    },
    tree: { id: 'id', pid: 'parent_id', children: 'children' },
    beforeFetch: (params: any) => ({ ...params, page: 1, limit: 999 }),
    afterFetch: (res: any) => {
      const items = res?.items || [];
      return { items: arrayToTree(items), total: res?.total ?? items.length };
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'name',
        title: $t('web.menu.table.columns.name'),
        minWidth: 200,
        treeNode: true,
        align: 'left',
      },
      {
        field: 'category',
        title: $t('web.menu.table.columns.category'),
        minWidth: 80,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.WEB_MENU_CATEGORY },
      },
      { field: 'url', title: $t('web.menu.table.columns.url'), minWidth: 100 },
      { field: 'sort', title: $t('web.menu.table.columns.sort'), minWidth: 80 },
      {
        field: 'type',
        title: $t('web.menu.table.columns.type'),
        minWidth: 80,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.WEB_MENU_TYPE },
      },
      {
        field: 'target',
        title: $t('web.menu.table.columns.target'),
        minWidth: 80,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.WEB_MENU_TARGET },
      },
      {
        field: 'is_show',
        title: $t('web.menu.table.columns.is_show'),
        minWidth: 80,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.SYS_YES_NO },
      },
      {
        field: 'enabled',
        title: $t('web.menu.table.columns.enabled'),
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
          component: 'ApiSelect',
          fieldName: 'app',
          label: $t('web.menu.table.search.app'),
          defaultValue: 'web',
          componentProps: {
            api: '/system/menu/app/list',
            requestMethod: 'GET',
          },
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_category',
          label: $t('web.menu.table.search.category'),
          componentProps: { code: DictEnum.WEB_MENU_CATEGORY, clearable: true },
        },
        {
          component: 'Input',
          fieldName: 'LINK_name',
          label: $t('web.menu.table.search.name'),
          componentProps: { clearable: true },
        },
        {
          component: 'ApiDict',
          fieldName: 'type',
          label: $t('web.menu.table.search.type'),
          componentProps: { code: DictEnum.WEB_MENU_TYPE, clearable: true },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t('web.menu.title'),
      width: 'w-[60%]',
      dialogType: 'drawer',
      wrapperClass: 'grid-cols-2',
      commonConfig: { labelWidth: 130 },
      schema: [
        {
          fieldName: 'id',
          label: 'ID',
          component: 'Input',
          dependencies: { triggerFields: ['id'], show: false },
        },
        {
          fieldName: 'category',
          label: $t('web.menu.form.category'),
          component: 'ApiDict',
          defaultValue: 1,
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            renderType: 'RadioGroup',
            code: DictEnum.WEB_MENU_CATEGORY,
            isBtn: true,
          },
        },
        {
          fieldName: 'app',
          label: $t('web.menu.form.app'),
          component: 'ApiSelect',
          defaultValue: 'web',
          formItemClass: 'col-span-2',
          componentProps: {
            api: '/system/menu/app/list',
            requestMethod: 'GET',
          },
        },
        {
          fieldName: 'source',
          label: $t('web.menu.form.source'),
          component: 'Input',
          defaultValue: 'create',
          formItemClass: 'col-span-2',
        },
        {
          fieldName: 'name',
          label: $t('web.menu.form.name'),
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
        },
        {
          fieldName: 'type',
          label: $t('web.menu.form.type'),
          component: 'ApiDict',
          defaultValue: 1,
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: { code: DictEnum.WEB_MENU_TYPE },
        },
        {
          fieldName: 'pid',
          label: $t('web.menu.form.pid'),
          component: 'ApiTreeSelect',
          formItemClass: 'col-span-2',
          componentProps: (v: any) => ({
            placeholder: $t('web.menu.form.placeholder_pid'),
            clearable: true,
            checkStrictly: true,
            api: '/web/menu',
            requestMethod: 'get',
            params: {
              format: 'tree',
              app: v.app || 'web',
              category: v.category || 1,
            },
            labelField: 'name',
            valueField: 'id',
          }),
        },
        {
          fieldName: 'url',
          label: $t('web.menu.form.url'),
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: (v: any) => ({
            placeholder: $t('web.menu.form.placeholder_url'),
            clearable: true,
            disabled: ![2, 3, 4].includes(v.type),
          }),
        },
        {
          fieldName: 'target',
          label: $t('web.menu.form.target'),
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-1',
          componentProps: (v: any) => ({
            code: DictEnum.WEB_MENU_TARGET,
            disabled: ![2, 3, 4].includes(v.type),
          }),
        },
        {
          fieldName: 'icon',
          label: $t('web.menu.form.icon'),
          component: 'IconPicker',
          formItemClass: 'col-span-1',
        },
        {
          fieldName: 'sort',
          label: $t('web.menu.form.sort'),
          component: 'InputNumber',
          defaultValue: 999,
          formItemClass: 'col-span-1',
          componentProps: { min: -1 },
        },
        {
          fieldName: 'enabled',
          label: $t('web.menu.form.enabled'),
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-1',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true,
            renderType: 'RadioGroup',
          },
        },
        {
          fieldName: 'is_show',
          label: $t('web.menu.form.is_show'),
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-1',
          componentProps: {
            code: DictEnum.SYS_YES_NO,
            isBtn: true,
            renderType: 'RadioGroup',
          },
        },
      ],
    },
  };
};
