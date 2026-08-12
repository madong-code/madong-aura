import type { CrudSchema } from '#/components/crud/components/types';

import { OperateLogService } from '#/api/ops';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: OperateLogService.list,
      add: OperateLogService.create as any,
      edit: OperateLogService.update as any,
      remove: OperateLogService.delete,
      batchRemove: OperateLogService.remove,
      view: OperateLogService.get,
    },
    // ========== 扁平化表格配置 ==========
    hasAdd: false,
    hasEdit: false,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'logs:operate:create',
      edit: 'logs:operate:update',
      remove: 'logs:operate:delete',
      view: 'logs:operate:read',
    },
    columns: [
      { type: 'checkbox', width: 60, align: 'left' },
      {
        field: 'user_name',
        title: $t('ops.logs.operate.table.columns.user_name'),
        width: 90,
        align: 'left',
      },
      {
        field: 'name',
        title: $t('ops.logs.operate.table.columns.name'),
        minWidth: 170,
        align: 'left',
      },
      {
        field: 'ip',
        title: $t('ops.logs.operate.table.columns.ip'),
        width: 110,
        align: 'left',
      },
      {
        field: 'ip_location',
        title: $t('ops.logs.operate.table.columns.ip_location'),
        minWidth: 120,
        align: 'left',
        visible: false,
      },
      {
        field: 'os',
        title: $t('ops.logs.operate.table.columns.os'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'browser',
        title: $t('ops.logs.operate.table.columns.browser'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'url',
        title: $t('ops.logs.operate.table.columns.url'),
        minWidth: 170,
        align: 'left',
      },
      {
        field: 'param',
        title: $t('ops.logs.operate.table.columns.param'),
        minWidth: 170,
        align: 'left',
      },
      {
        field: 'created_at',
        title: $t('ops.logs.operate.table.columns.created_at'),
        width: 170,
        formatter: 'formatDateTime',
      },
    ],
    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'Input',
          fieldName: 'LIKE_user_name',
          label: $t('ops.logs.operate.table.search.user_name'),
          componentProps: { clearable: true },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_ip',
          label: $t('ops.logs.operate.table.search.ip'),
          componentProps: { clearable: true },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_url',
          label: $t('ops.logs.operate.table.search.url'),
          componentProps: { clearable: true },
        },
        {
          component: 'DatePicker',
          fieldName: 'BETWEEN_created_at',
          label: $t('ops.logs.operate.table.search.created_date'),
          componentProps: { type: 'daterange' },
        },
      ],
    },
    formDialog: {
      enabled: true,
      title: $t('ops.logs.operate.title'),
      width: 'w-[50%]',
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
          fieldName: 'app',
          label: $t('ops.logs.operate.form.app'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'ip',
          label: $t('ops.logs.operate.form.ip'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'class_name',
          label: $t('ops.logs.operate.form.class_name'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'method',
          label: $t('ops.logs.operate.form.method'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'action',
          label: $t('ops.logs.operate.form.action'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'created_date',
          label: $t('ops.logs.operate.form.created_date'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'user_name',
          label: $t('ops.logs.operate.form.user_name'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'param',
          label: $t('ops.logs.operate.form.param'),
          component: 'Input',
          componentProps: { type: 'textarea', readOnly: true, rows: 5 },
        },
        {
          fieldName: 'result',
          label: $t('ops.logs.operate.form.result'),
          component: 'Input',
          componentProps: { type: 'textarea', readOnly: true, rows: 8 },
        },
      ],
    },
  };
};
