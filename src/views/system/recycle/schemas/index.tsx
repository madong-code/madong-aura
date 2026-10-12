import type { CrudSchema } from '#/components/crud/components/types';

import { RecycleBinService } from '#/api/system';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: RecycleBinService.list,
      add: RecycleBinService.create,
      edit: RecycleBinService.update,
      remove: RecycleBinService.delete,
      batchRemove: RecycleBinService.remove,
      view: RecycleBinService.get,
    },
    hasAdd: false,
    hasEdit: false,
    hasView: true,
    hasRemove: false,
    permissions: {
      remove: 'system:recycle:delete',
      view: 'system:recycle:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'table_name',
        title: $t('system.recycle.table.columns.table_name'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'data',
        title: $t('system.recycle.table.columns.data'),
        minWidth: 300,
        align: 'left',
        formatter: ({ cellValue }: any) => {
          if (!cellValue) return '--';
          try {
            const obj =
              typeof cellValue === 'string' ? JSON.parse(cellValue) : cellValue;
            const json = JSON.stringify(obj, null, 2);
            return json.length > 500 ? `${json.slice(0, 500)}\n...` : json;
          } catch {
            return cellValue;
          }
        },
      },
      { field: 'ip', title: 'IP', minWidth: 130, align: 'left' },
      {
        field: 'enabled',
        title: $t('system.recycle.table.columns.is_restore'),
        width: 90,
        align: 'center',
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_YES_NO },
        },
      },
      {
        field: 'created_date',
        title: $t('system.recycle.table.columns.created_date'),
        width: 150,
        align: 'center',
      },
    ],
    tableActionColumn: { align: 'center' },

    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'Input',
          fieldName: 'LIKE_table_name',
          label: $t('system.recycle.table.search.table_name'),
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_enabled',
          label: $t('system.recycle.table.search.enabled'),
          componentProps: { code: DictEnum.SYS_YES_NO, clearable: true },
        },
      ],
    },
    formDialog: {
      enabled: true,
      title: $t('system.recycle.title'),
      width: 'w-[50%]',
      dialogType: 'drawer',
      wrapperClass: 'grid-cols-1',
      commonConfig: { labelWidth: 100 },
      schema: [
        {
          fieldName: 'id',
          label: 'ID',
          component: 'Input',
          dependencies: { triggerFields: ['id'], show: false },
        },
        {
          fieldName: 'table_name',
          label: $t('system.recycle.form.modal.table_name'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'operate_name',
          label: $t('system.recycle.form.modal.operate_name'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'ip',
          label: $t('system.recycle.form.modal.ip'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'created_date',
          label: $t('system.recycle.form.modal.created_date'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'enabled',
          label: $t('system.recycle.form.modal.enabled'),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_YES_NO,
            renderType: 'RadioGroup',
          },
        },
        {
          fieldName: 'data',
          label: $t('system.recycle.form.modal.data'),
          component: 'Textarea',
          componentProps: { readOnly: true, rows: 20, formatJson: true },
        },
      ],
    },
  };
};
