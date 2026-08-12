import type { CrudSchema } from '#/components/crud/components/types';

import { LoginLogService } from '#/api/ops';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: LoginLogService.list,
      add: LoginLogService.create as any,
      edit: LoginLogService.update as any,
      remove: LoginLogService.delete,
      batchRemove: LoginLogService.remove,
      view: LoginLogService.get,
    },
    // ========== 扁平化表格配置 ==========
    hasAdd: false,
    hasEdit: false,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'system:logs_login:create',
      edit: 'system:logs_login:update',
      remove: 'system:logs_login:delete',
      view: 'system:logs_login:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'account.user_name',
        title: $t('ops.logs.login.table.columns.user_name'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'account.real_name',
        title: $t('ops.logs.login.table.columns.real_name'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'status',
        title: $t('ops.logs.login.table.columns.status'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_OPERATION_RESULT },
        },
      },
      {
        field: 'os',
        title: $t('ops.logs.login.table.columns.os'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'browser',
        title: $t('ops.logs.login.table.columns.browser'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'ip',
        title: $t('ops.logs.login.table.columns.ip'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'ip_location',
        title: $t('ops.logs.login.table.columns.ip_location'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'created_at',
        title: $t('ops.logs.login.table.columns.login_date'),
        minWidth: 170,
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
          label: $t('ops.logs.login.table.search.user_name'),
          componentProps: { clearable: true },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_ip',
          label: $t('ops.logs.login.table.search.ip'),
          componentProps: { clearable: true },
        },
        {
          component: 'ApiDict',
          fieldName: 'status',
          label: $t('ops.logs.login.table.search.status'),
          componentProps: {
            code: DictEnum.SYS_OPERATION_RESULT,
            clearable: true,
          },
        },
        {
          component: 'DatePicker',
          fieldName: 'BETWEEN_created_at',
          label: $t('ops.logs.login.table.search.created_date'),
          componentProps: { type: 'daterange' },
        },
      ],
    },
    formDialog: {
      enabled: true,
      title: $t('ops.logs.login.title'),
      width: 'w-[50%]',
      wrapperClass: 'grid-cols-1',
      commonConfig: { labelWidth: 100 },
      schema: [
        {
          fieldName: 'id',
          label: 'ID',
          component: 'Input',
          dependencies: { show: false, triggerFields: ['id'] },
        },
        {
          fieldName: 'user_name',
          label: $t('ops.logs.login.table.columns.user_name'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'status',
          label: $t('ops.logs.login.table.columns.status'),
          component: 'ApiDict',
          componentProps: { code: DictEnum.SYS_OPERATION_RESULT },
        },
        {
          fieldName: 'os',
          label: $t('ops.logs.login.table.columns.os'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'browser',
          label: $t('ops.logs.login.table.columns.browser'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'ip',
          label: $t('ops.logs.login.table.columns.ip'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'ip_location',
          label: $t('ops.logs.login.table.columns.ip_location'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'created_date',
          label: $t('ops.logs.login.table.columns.login_date'),
          component: 'Input',
          componentProps: { readOnly: true },
        },
        {
          fieldName: 'remark',
          label: $t('ops.logs.login.table.columns.remark'),
          component: 'Input',
          componentProps: { type: 'textarea', readOnly: true, rows: 8 },
        },
      ],
    },
  };
};
