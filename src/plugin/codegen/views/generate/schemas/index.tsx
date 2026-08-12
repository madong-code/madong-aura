import type { CrudSchema } from '#/adapter/crud';

import { GeneratorCodeService } from '#/api/app/plugin/codegen';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => ({
  rowKey: 'id',
  crudApi: {
    list: (params) => GeneratorCodeService.getList(params),
    add: (data) => GeneratorCodeService.create(data),
    edit: (data) => GeneratorCodeService.update(data.id, data),
    remove: (id) => GeneratorCodeService.remove(id),
    view: (id) => GeneratorCodeService.get(id),
    batchRemove: (data) => GeneratorCodeService.batchRemove(data),
  },
  hasAdd: false,
  hasEdit: false,
  hasRemove: true,
  hasView: false,
  permissions: {
    add: 'generator:code:create',
    remove: 'generator:code:delete',
    edit: 'generator:code:update',
    view: 'generator:code:read',
  },
  columns: [
    { type: 'checkbox', width: 60 },
    {
      field: 'plugin_name',
      title: $t('codegen.generate.list.plugin_name'),
      align: 'left',
      minWidth: 80,
      formatter: ({ cellValue }: any) => cellValue || '/',
    },
    {
      field: 'table_name',
      title: $t('codegen.generate.list.table_name'),
      align: 'left',
      minWidth: 120,
    },
    {
      field: 'table_content',
      title: $t('codegen.generate.list.table_content'),
      minWidth: 160,
      align: 'left',
    },
    {
      field: 'created_at',
      title: $t('codegen.generate.list.created_date'),
      width: 150,
      formatter: 'formatDateTime',
      visible: false,
    },
    {
      field: 'updated_at',
      title: $t('codegen.generate.list.updated_date'),
      width: 150,
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
        fieldName: 'LIKE_table_name',
        label: $t('codegen.generate.list.query.table_name'),
        componentProps: {
          placeholder: $t('codegen.generate.list.query.placeholder_table_name'),
          clearable: true,
        },
      },
    ],
  },
  formDialog: {
    enabled: true,
    schema: [],
  },
});
