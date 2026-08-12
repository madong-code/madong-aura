import type { CrudSchema } from '#/components/crud/components/types';

import { DeptService } from '#/api/system/dept';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

/**
 * 将扁平数组转换为树形结构
 */
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
      list: DeptService.list,
      add: DeptService.create,
      edit: DeptService.update,
      remove: DeptService.delete,
      batchRemove: DeptService.remove,
      view: DeptService.get,
    },

    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'org:dept:create',
      edit: 'org:dept:update',
      remove: 'org:dept:delete',
      view: 'org:dept:read',
    },
    tree: { id: 'id', pid: 'pid', children: 'children' },
    beforeFetch: (params: any) => ({ ...params, page: 1, limit: 999 }),
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
        field: 'name',
        title: $t('system.dept.table.columns.name'),
        minWidth: 200,
        treeNode: true,
        align: 'left',
      },
      {
        field: 'code',
        title: $t('system.dept.table.columns.code'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'sort',
        title: $t('system.dept.table.columns.sort'),
        minWidth: 80,
      },
      {
        field: 'leader',
        title: $t('system.dept.table.columns.leader'),
        minWidth: 180,
        align: 'left',
        vxeColumn: {
          formatter: ({ cellValue }: any) => {
            if (
              !cellValue ||
              !Array.isArray(cellValue) ||
              cellValue.length === 0
            )
              return '-';
            return cellValue.map((l: any) => l.real_name || l.name).join('、');
          },
        },
      },
      {
        field: 'enabled',
        title: $t('system.dept.table.columns.enabled'),
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
          component: 'Input',
          fieldName: 'code',
          label: $t('system.dept.table.search.code'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.dept.table.search.placeholder.code'),
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_name',
          label: $t('system.dept.table.search.name'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.dept.table.search.placeholder.name'),
          },
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_enabled',
          label: $t('system.dept.table.search.enabled'),
          componentProps: {
            code: DictEnum.SYS_YES_NO,
            clearable: true,
            placeholder: $t('system.dept.table.search.placeholder.enabled'),
          },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t('system.dept.title'),
      width: 'w-[50%]',
      wrapperClass: 'grid-cols-1',
      commonConfig: {
        labelWidth: 100,
        labelAlign: 'right',
      },
      schema: [
        {
          label: $t('system.dept.form.id'),
          fieldName: 'id',
          component: 'Input',
          formItemClass: 'col-span-2',
          dependencies: { triggerFields: ['id'], show: false },
        },
        {
          label: $t('system.dept.form.parent_dept'),
          fieldName: 'pid',
          component: 'ApiTreeSelect',
          defaultValue: undefined,
          formItemClass: 'col-span-2',
          componentProps: {
            api: '/system/dept',
            params: { format: 'tree' },
            requestMethod: 'get',
            checkStrictly: true,
            clearable: true,
            placeholder: $t('system.dept.form.placeholder.parent_dept'),
          },
        },
        {
          label: $t('system.dept.form.name'),
          fieldName: 'name',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('system.dept.form.placeholder.name'),
          },
        },
        {
          label: $t('system.dept.form.code'),
          fieldName: 'code',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('system.dept.form.placeholder.code'),
          },
        },
        {
          label: $t('system.dept.form.sort'),
          fieldName: 'sort',
          component: 'InputNumber',
          defaultValue: 0,
          formItemClass: 'col-span-2',
          componentProps: { min: 0, max: 9999 },
        },
        {
          label: $t('system.dept.form.enabled'),
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
          label: $t('system.dept.form.leader'),
          fieldName: 'leader_id_list',
          component: 'ApiSelect',
          formItemClass: 'col-span-2',
          defaultValue: [],
          componentProps: {
            api: '/system/admin',
            requestMethod: 'get',
            params: { format: 'select' },
            placeholder: $t('system.dept.form.placeholder.leader'),
            multiple: true,
          },
        },
        {
          label: $t('system.dept.form.remark'),
          fieldName: 'remark',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'textarea',
            rows: 3,
            placeholder: $t('system.dept.form.placeholder.remark'),
          },
        },
      ],
    },
  };
};
