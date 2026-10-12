import type { CrudSchema } from '#/components/crud/components/types';

import { CrontabLogService } from '#/api/ops';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (crontab_id?: number | string): CrudSchema => {
  return {
    crudApi: {
      list: CrontabLogService.list,
      add: CrontabLogService.create,
      edit: CrontabLogService.update,
      remove: CrontabLogService.delete,
      batchRemove: CrontabLogService.remove,
      view: CrontabLogService.get,
    },
    // ========== 扁平化表格配置 ==========
    hasAdd: false,
    hasEdit: false,
    hasView: false,
    hasRemove: true,
    permissions: {
      remove: 'crontab:log:delete',
      view: 'crontab:log:read',
    },
    beforeFetch: (params) => {
      return {
        ...params,
        crontab_id,
      };
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'target',
        title: $t('ops.crontab.log.table.columns.target'),
        width: 170,
        align: 'left',
      },
      {
        field: 'running_time',
        title: $t('ops.crontab.log.table.columns.running_time'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'return_code',
        title: $t('ops.crontab.log.table.columns.return_code'),
        minWidth: 100,
        viewComponent: 'CellDictTag',
        viewComponentProps: { code: DictEnum.SYS_OPERATION_RESULT },
      },
      {
        field: 'log',
        title: $t('ops.crontab.log.table.columns.log'),
        minWidth: 200,
        align: 'left',
      },
      {
        field: 'created_date',
        title: $t('ops.crontab.log.table.columns.created_date'),
        minWidth: 140,
        align: 'left',
      },
    ],
    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'Input',
          fieldName: 'LIKE_target',
          label: $t('ops.crontab.log.table.search.target'),
        },
        {
          component: 'ApiDict',
          fieldName: 'return_code',
          label: $t('ops.crontab.log.table.search.return_code'),
          componentProps: {
            code: DictEnum.SYS_OPERATION_RESULT,
            clearable: true,
          },
        },
      ],
    },
    // 启用 formDialog 以暴露「勾选批量删除 / 行删除」按钮（本页无新增/编辑表单，schema 为空，不会弹出表单）
    formDialog: { enabled: true, schema: [] },
  };
};
