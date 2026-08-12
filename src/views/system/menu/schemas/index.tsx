import type { CrudSchema } from '#/components/crud/components/types';

import { MenuService } from '#/api/system';
import { Icon } from '#/components/icon';
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

  data.forEach((item) => {
    map.set(item[idKey], { ...item, [childrenKey]: [] });
  });

  data.forEach((item) => {
    const node = map.get(item[idKey]);
    if (
      item[pidKey] === null ||
      item[pidKey] === undefined ||
      item[pidKey] === 0
    ) {
      roots.push(node);
    } else {
      const parent = map.get(item[pidKey]);
      if (parent) {
        parent[childrenKey].push(node);
      } else {
        roots.push(node);
      }
    }
  });

  return roots;
}

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: MenuService.list,
      add: MenuService.create,
      edit: MenuService.update,
      remove: MenuService.delete,
      batchRemove: MenuService.remove,
      view: MenuService.get,
    },

    // ========== 扁平化表格配置 ==========
    rowKey: 'id',
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    hasBatchRemove: true,
    permissions: {
      add: 'system:menu:create',
      edit: 'system:menu:update',
      remove: 'system:menu:delete',
      view: 'system:menu:read',
    },
    tree: { id: 'id', pid: 'pid', children: 'children', reserve: true },
    beforeFetch: (params: any) => {
      return { ...params, page: 1, limit: 999 };
    },
    afterFetch: (res: { items?: any[]; total?: number }) => {
      const items = res?.items || [];
      return {
        items: arrayToTree(items),
        total: res?.total ?? items.length,
      };
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'id',
        title: $t('system.menu.table.columns.id'),
        minWidth: 60,
        visible: false,
      },
      {
        field: 'title',
        title: $t('system.menu.table.columns.title'),
        minWidth: 200,
        treeNode: true,
        align: 'left',
        slots: {
          default: ({ row }: any) => (
            <span>
              <Icon class="mr-1" icon={row.icon} />
              {row.title}
            </span>
          ),
        },
      },
      {
        field: 'code',
        title: $t('system.menu.table.columns.code'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'type',
        title: $t('system.menu.table.columns.type'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_MENU_TYPE },
        },
      },
      {
        field: 'path',
        title: $t('system.menu.table.columns.path'),
        minWidth: 150,
        align: 'left',
      },
      {
        field: 'component',
        title: $t('system.menu.table.columns.component'),
        minWidth: 150,
        align: 'left',
      },
      {
        field: 'sort',
        title: $t('system.menu.table.columns.sort'),
        minWidth: 60,
      },
      {
        field: 'is_show',
        title: $t('system.menu.table.columns.is_show'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_YES_NO },
        },
      },
      {
        field: 'enabled',
        title: $t('system.menu.table.columns.enabled'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ENABLED_STATUS },
        },
      },
    ],

    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'ApiDict',
          fieldName: 'EQ_type',
          label: $t('system.menu.table.search.type'),
          componentProps: {
            code: DictEnum.SYS_MENU_TYPE,
            clearable: true,
            placeholder: $t('system.menu.table.search.placeholder.type'),
          },
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_enabled',
          label: $t('system.menu.table.search.enabled'),
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true,
            placeholder: $t('system.menu.table.search.placeholder.enabled'),
          },
        },
        {
          component: 'ApiSelect',
          fieldName: 'EQ_app',
          label: $t('system.menu.form.modal.app'),
          defaultValue: 'admin',
          componentProps: {
            api: '/system/menu/app/list',
            requestMethod: 'GET',
            placeholder: $t('system.menu.form.placeholder.app'),
            clearable: true,
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_title',
          label: $t('system.menu.table.search.title'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.menu.table.search.placeholder.title'),
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_code',
          label: $t('system.menu.table.search.code'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.menu.table.search.placeholder.code'),
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_path',
          label: $t('system.menu.table.search.path'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.menu.table.search.placeholder.path'),
          },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t('system.menu.title'),
      width: 'w-[60%]',
      dialogType: 'drawer',
      wrapperClass: 'grid-cols-2',
      commonConfig: {
        labelWidth: 80,
        labelAlign: 'right',
      },
      schema: [
        {
          label: $t('system.menu.form.modal.id'),
          fieldName: 'id',
          component: 'Input',
          formItemClass: 'col-span-2',
          dependencies: {
            triggerFields: ['id'],
            show: false,
          },
        },
        {
          label: $t('system.menu.form.modal.type'),
          fieldName: 'type',
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-2',
          rules: 'required',
          componentProps: (_value) => {
            return {
              placeholder: $t('system.menu.form.placeholder.type'),
              code: DictEnum.SYS_MENU_TYPE,
              isBtn: true,
              renderType: 'RadioGroup',
              onChange: (val: any) => {
                if (val !== 2) {
                  _value.openType = 0;
                }
              },
            };
          },
        },
        {
          label: $t('system.menu.form.modal.app'),
          fieldName: 'app',
          component: 'ApiTreeSelect',
          defaultValue: 'admin',
          formItemClass: 'col-span-2',
          rules: 'required',
          componentProps: (_value) => {
            return {
              api: '/system/menu/app/list',
              requestMethod: 'get',
              placeholder: $t('system.menu.form.placeholder.app'),
              style: {
                width: '330px',
              },
              labelField: 'label',
              valueField: 'value',
              onChange: (_values: any) => {
                _value.pid = '';
              },
            };
          },
        },
        {
          label: $t('system.menu.form.modal.pid'),
          fieldName: 'pid',
          component: 'ApiTreeSelect',
          formItemClass: 'col-span-1',
          componentProps: (_value) => {
            return {
              placeholder: $t('system.menu.form.placeholder.pid'),
              clearable: true,
              disabled: !_value?.app,
              checkStrictly: true,
              api: '/system/menu',
              requestMethod: 'get',
              params: {
                format: 'tree',
                app: _value.app || 'admin',
              },
              labelField: 'name',
              valueField: 'id',
            };
          },
        },
        {
          label: $t('system.menu.form.modal.title'),
          fieldName: 'title',
          component: 'Input',
          formItemClass: 'col-span-1',
          rules: 'required',
          componentProps: {
            placeholder: $t('system.menu.form.placeholder.title'),
            clearable: true,
          },
        },
        {
          label: $t('system.menu.form.modal.code'),
          fieldName: 'code',
          component: 'Input',
          formItemClass: 'col-span-1',
          rules: 'required',
          componentProps: {
            placeholder: $t('system.menu.form.placeholder.code'),
            clearable: true,
          },
        },
        {
          label: $t('system.menu.form.modal.path'),
          fieldName: 'path',
          component: 'Input',
          formItemClass: 'col-span-1',
          help: $t('system.menu.form.help.path'),
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.path'),
              clearable: true,
              disabled: ![1, 2, 4].includes(values.type),
            };
          },
        },
        {
          label: $t('system.menu.form.modal.component'),
          fieldName: 'component',
          component: 'Input',
          formItemClass: 'col-span-1',
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.component'),
              clearable: true,
              disabled: ![1, 2].includes(values.type),
            };
          },
        },
        {
          label: $t('system.menu.form.modal.open_type'),
          fieldName: 'openType',
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-1',
          rules: 'required',
          dependencies: {
            triggerFields: ['type'],
            rules: (value: any) => (value.type === 2 ? 'required' : null),
          },
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.open_type'),
              code: DictEnum.SYS_MENU_OPEN_TYPE,
              isBtn: true,
              renderType: 'RadioGroup',
              disabled: values.type !== 2,
            };
          },
        },
        {
          label: $t('system.menu.form.modal.icon'),
          fieldName: 'icon',
          component: 'IconPicker',
          formItemClass: 'col-span-1',
          componentProps: (values) => {
            return {
              class: 'w-full',
              placeholder: $t('system.menu.form.placeholder.icon'),
              clearable: true,
              disabled: ![1, 2].includes(values.type),
            };
          },
        },
        {
          label: $t('system.menu.form.modal.link_url'),
          fieldName: 'url',
          component: 'Input',
          formItemClass: 'col-span-1',
          help: $t('system.menu.form.help.link_url'),
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.link_url'),
              clearable: true,
              disabled: ![2, 3].includes(values.openType),
            };
          },
        },
        {
          label: $t('system.menu.form.modal.sort'),
          fieldName: 'sort',
          component: 'InputNumber',
          formItemClass: 'col-span-1',
          defaultValue: 999,
          componentProps: {
            placeholder: $t('system.menu.form.placeholder.sort'),
            clearable: true,
            min: 0,
          },
        },
        {
          label: $t('system.menu.form.modal.enabled'),
          fieldName: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-1',
          componentProps: {
            placeholder: $t('system.menu.form.placeholder.enabled'),
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true,
            renderType: 'RadioGroup',
          },
        },
        {
          label: $t('system.menu.form.modal.is_show'),
          fieldName: 'isShow',
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-1',
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.is_show'),
              code: DictEnum.SYS_YES_NO,
              isBtn: true,
              renderType: 'RadioGroup',
              disabled: ![1, 2].includes(values.type),
            };
          },
        },
        {
          label: $t('system.menu.form.modal.is_sync'),
          fieldName: 'isSync',
          component: 'ApiDict',
          defaultValue: 0,
          formItemClass: 'col-span-1',
          componentProps: {
            placeholder: $t('system.menu.form.placeholder.is_sync'),
            code: DictEnum.SYS_YES_NO,
            isBtn: true,
            renderType: 'RadioGroup',
          },
        },
        {
          label: $t('system.menu.form.modal.is_cache'),
          fieldName: 'isCache',
          component: 'ApiDict',
          defaultValue: 0,
          formItemClass: 'col-span-1',
          componentProps: (values) => {
            return {
              placeholder: $t('system.menu.form.placeholder.is_cache'),
              code: DictEnum.SYS_YES_NO,
              isBtn: true,
              renderType: 'RadioGroup',
              disabled: ![1, 2].includes(values.type),
            };
          },
        },
      ],
    },
  };
};
