import type { CrudSchema } from '#/components/crud/components/types';

import { FilesService } from '#/api/system';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: FilesService.list,
      add: FilesService.create,
      edit: FilesService.update,
      remove: FilesService.delete,
      batchRemove: FilesService.remove,
      view: FilesService.get,
    },
    // ========== 扁平化表格配置 ==========
    hasAdd: false,
    hasEdit: false,
    hasView: false,
    hasRemove: false,
    permissions: {
      add: 'upload:files:create',
      edit: 'upload:files:update',
      remove: 'upload:files:delete',
      view: 'upload:files:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'filename',
        title: $t('system.files.table.columns.filename'),
        minWidth: 200,
        align: 'left',
      },
      {
        field: 'original_filename',
        title: $t('system.files.table.columns.original_filename'),
        width: 200,
        align: 'left',
      },
      {
        field: 'size_info',
        title: $t('system.files.table.columns.size_info'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'ext',
        title: $t('system.files.table.columns.ext'),
        width: 80,
      },
      {
        field: 'platform',
        title: $t('system.files.table.columns.platform'),
        minWidth: 100,
      },
      {
        field: 'created_date',
        title: $t('system.files.table.columns.created_date'),
        width: 170,
      },
      {
        field: 'created_name',
        title: $t('system.files.table.columns.created_name'),
        minWidth: 100,
      },
    ],
    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'Input',
          fieldName: 'LIKE_filename',
          label: $t('system.files.table.search.filename'),
        },
        {
          component: 'Input',
          fieldName: 'LIKE_original_filename',
          label: $t('system.files.table.search.original_filename'),
        },
        {
          component: 'Input',
          fieldName: 'LIKE_ext',
          label: $t('system.files.table.search.ext'),
        },
        {
          component: 'Input',
          fieldName: 'IN_platform',
          label: $t('system.files.table.search.platform'),
        },
      ],
    },
    formDialog: { enabled: true, schema: [] },
  };
};
