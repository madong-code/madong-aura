import type { CrudSchema } from '#/components/crud/components/types';

import { GatewayBlacklistService } from '#/api/ops/gateway';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: GatewayBlacklistService.list,
      add: GatewayBlacklistService.create,
      edit: GatewayBlacklistService.update,
      remove: GatewayBlacklistService.delete,
      batchRemove: GatewayBlacklistService.remove,
      view: GatewayBlacklistService.get,
    },

    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'gateway:blacklist:create',
      edit: 'gateway:blacklist:update',
      remove: 'gateway:blacklist:delete',
      view: 'gateway:blacklist:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'priority',
        title: $t('ops.gateway.blacklist.table.columns.priority'),
        width: 80,
      },
      {
        field: 'name',
        title: $t('ops.gateway.blacklist.table.columns.name'),
        minWidth: 150,
        align: 'left',
      },
      {
        field: 'ip',
        title: $t('ops.gateway.blacklist.table.columns.ip'),
        minWidth: 150,
        align: 'left',
      },
      {
        field: 'match_type',
        title: $t('ops.gateway.blacklist.table.columns.match_type'),
        width: 120,
      },
      {
        field: 'methods',
        title: $t('ops.gateway.blacklist.table.columns.methods'),
        minWidth: 90,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.SYS_REQUEST_MODE },
      },
      {
        field: 'path',
        title: $t('ops.gateway.blacklist.table.columns.path'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'enabled',
        title: $t('ops.gateway.blacklist.table.columns.enabled'),
        width: 100,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.SYS_ENABLED_STATUS },
      },
      {
        field: 'start_date',
        title: $t('ops.gateway.blacklist.table.columns.start_date'),
        minWidth: 180,
      },
      {
        field: 'end_date',
        title: $t('ops.gateway.blacklist.table.columns.end_date'),
        minWidth: 180,
      },
      {
        field: 'created_at',
        title: $t('ops.gateway.blacklist.table.columns.created_date'),
        minWidth: 180,
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
          label: $t('ops.gateway.blacklist.table.search.name'),
          componentProps: {
            placeholder: $t(
              'ops.gateway.blacklist.table.search.placeholder.name',
            ),
            clearable: true,
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_ip',
          label: $t('ops.gateway.blacklist.table.search.ip'),
          componentProps: {
            placeholder: $t(
              'ops.gateway.blacklist.table.search.placeholder.ip',
            ),
            clearable: true,
          },
        },
        {
          component: 'Input',
          fieldName: 'path',
          label: $t('ops.gateway.blacklist.table.search.path'),
          componentProps: {
            placeholder: $t(
              'ops.gateway.blacklist.table.search.placeholder.path',
            ),
            clearable: true,
          },
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_enabled',
          label: $t('ops.gateway.blacklist.table.search.enabled'),
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true,
            placeholder: $t(
              'ops.gateway.blacklist.table.search.placeholder.enabled',
            ),
          },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t('ops.gateway.blacklist.title'),
      width: 'w-[50%]',
      wrapperClass: 'grid-cols-1',
      commonConfig: {
        labelWidth: 100,
        labelAlign: 'right',
      },
      schema: [
        {
          label: $t('ops.gateway.blacklist.form.modal.id'),
          fieldName: 'id',
          component: 'Input',
          formItemClass: 'col-span-2',
          dependencies: { triggerFields: ['id'], show: false },
        },
        {
          label: $t('ops.gateway.blacklist.form.modal.name'),
          fieldName: 'name',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t(
              'ops.gateway.blacklist.form.modal.placeholder.name',
            ),
            clearable: true,
          },
        },
        {
          label: $t('ops.gateway.blacklist.form.modal.match_type'),
          fieldName: 'match_type',
          component: 'Select',
          defaultValue: 'exact',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t(
              'ops.gateway.blacklist.form.modal.placeholder.match_type',
            ),
            clearable: true,
            options: [
              { label: '精确匹配', value: 'exact' },
              { label: '通配符匹配', value: 'wildcard' },
              { label: '正则表达式匹配', value: 'regex' },
            ],
          },
        },
        {
          label: $t('ops.gateway.blacklist.form.modal.priority'),
          fieldName: 'priority',
          component: 'Input',
          defaultValue: 100,
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'number',
            placeholder: $t(
              'ops.gateway.blacklist.form.modal.placeholder.priority',
            ),
            clearable: true,
          },
        },
        {
          label: $t('ops.gateway.blacklist.form.modal.ip'),
          fieldName: 'ip',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: '留空表示不限 IP',
            clearable: true,
          },
        },
        {
          label: $t('ops.gateway.blacklist.form.modal.methods'),
          fieldName: 'methods',
          component: 'ApiDict',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: { code: DictEnum.SYS_REQUEST_MODE },
        },
        {
          label: $t('ops.gateway.blacklist.form.modal.path'),
          fieldName: 'path',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t(
              'ops.gateway.blacklist.form.modal.placeholder.path',
            ),
            clearable: true,
          },
        },
        {
          label: $t('ops.gateway.blacklist.form.modal.start_time'),
          fieldName: 'start_date',
          component: 'DatePicker',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'datetime',
            placeholder: $t(
              'ops.gateway.blacklist.form.modal.placeholder.start_time',
            ),
            clearable: true,
            format: 'YYYY-MM-DD HH:mm:ss',
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
          },
        },
        {
          label: $t('ops.gateway.blacklist.form.modal.end_time'),
          fieldName: 'end_date',
          component: 'DatePicker',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'datetime',
            placeholder: $t(
              'ops.gateway.blacklist.form.modal.placeholder.end_time',
            ),
            clearable: true,
            format: 'YYYY-MM-DD HH:mm:ss',
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
          },
        },
        {
          label: $t('ops.gateway.blacklist.form.modal.enabled'),
          fieldName: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-2',
          componentProps: {
            renderType: 'RadioGroup',
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true,
          },
        },
        {
          label: $t('ops.gateway.blacklist.form.modal.message'),
          fieldName: 'message',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t(
              'ops.gateway.blacklist.form.modal.placeholder.message',
            ),
          },
        },
        {
          label: $t('ops.gateway.blacklist.form.modal.remark'),
          fieldName: 'remark',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t(
              'ops.gateway.blacklist.form.modal.placeholder.remark',
            ),
          },
        },
      ],
    },
  };
};
