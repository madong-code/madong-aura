import type { CrudSchema } from '#/components/crud/components/types';

import { GatewayLimiterService } from '#/api/ops/gateway';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: GatewayLimiterService.list,
      add: GatewayLimiterService.create,
      edit: GatewayLimiterService.update,
      remove: GatewayLimiterService.delete,
      batchRemove: GatewayLimiterService.remove,
      view: GatewayLimiterService.get,
    },

    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'gateway:limiter:create',
      edit: 'gateway:limiter:update',
      remove: 'gateway:limiter:delete',
      view: 'gateway:limiter:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'priority',
        title: $t('ops.gateway.limiter.table.columns.priority'),
        width: 60,
      },
      {
        field: 'name',
        title: $t('ops.gateway.limiter.table.columns.name'),
        minWidth: 150,
        align: 'left',
      },
      {
        field: 'match_type',
        title: $t('ops.gateway.limiter.table.columns.match_type'),
        width: 110,
      },
      {
        field: 'methods',
        title: $t('ops.gateway.limiter.table.columns.methods'),
        minWidth: 90,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.SYS_REQUEST_MODE },
      },
      {
        field: 'path',
        title: $t('ops.gateway.limiter.table.columns.path'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'enabled',
        title: $t('ops.gateway.limiter.table.columns.enabled'),
        width: 100,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.SYS_ENABLED_STATUS },
      },
      {
        field: 'limit_type',
        title: $t('ops.gateway.limiter.table.columns.limit_type'),
        width: 100,
      },
      {
        field: 'limit_value',
        title: $t('ops.gateway.limiter.table.columns.limit_value'),
        width: 100,
      },
      {
        field: 'period',
        title: $t('ops.gateway.limiter.table.columns.period'),
        width: 110,
      },
      {
        field: 'ttl',
        title: $t('ops.gateway.limiter.table.columns.ttl'),
        width: 80,
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
          label: $t('ops.gateway.limiter.table.search.name'),
          componentProps: {
            placeholder: $t(
              'ops.gateway.limiter.table.search.placeholder.name',
            ),
            clearable: true,
          },
        },
        {
          component: 'Input',
          fieldName: 'path',
          label: $t('ops.gateway.limiter.table.search.path'),
          componentProps: {
            placeholder: $t(
              'ops.gateway.limiter.table.search.placeholder.path',
            ),
            clearable: true,
          },
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_enabled',
          label: $t('ops.gateway.limiter.table.search.enabled'),
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true,
            placeholder: $t(
              'ops.gateway.limiter.table.search.placeholder.enabled',
            ),
          },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t('ops.gateway.limiter.title'),
      width: 'w-[50%]',
      wrapperClass: 'grid-cols-1',
      commonConfig: {
        labelWidth: 120,
        labelAlign: 'right',
      },
      schema: [
        {
          label: $t('ops.gateway.limiter.form.modal.name'),
          fieldName: 'name',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('ops.gateway.limiter.form.modal.placeholder.name'),
            clearable: true,
          },
        },
        {
          label: $t('ops.gateway.limiter.form.modal.match_type'),
          fieldName: 'match_type',
          component: 'Select',
          defaultValue: 'exact',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t(
              'ops.gateway.limiter.form.modal.placeholder.match_type',
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
          label: $t('ops.gateway.limiter.form.modal.limit_type'),
          fieldName: 'limit_type',
          component: 'Select',
          defaultValue: 'ip',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t(
              'ops.gateway.limiter.form.modal.placeholder.limit_type',
            ),
            clearable: true,
            options: [
              { label: 'IP限流', value: 'ip' },
              { label: '用户限流', value: 'user' },
            ],
          },
        },
        {
          label: $t('ops.gateway.limiter.form.modal.methods'),
          fieldName: 'methods',
          component: 'ApiDict',
          formItemClass: 'col-span-2',
          componentProps: { code: DictEnum.SYS_REQUEST_MODE },
        },
        {
          label: $t('ops.gateway.limiter.form.modal.path'),
          fieldName: 'path',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            placeholder: $t('ops.gateway.limiter.form.modal.placeholder.path'),
            clearable: true,
          },
        },
        {
          label: $t('ops.gateway.limiter.form.modal.limit_value'),
          fieldName: 'limit_value',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'number',
            placeholder: $t(
              'ops.gateway.limiter.form.modal.placeholder.limit_value',
            ),
          },
        },
        {
          label: $t('ops.gateway.limiter.form.modal.period'),
          fieldName: 'period',
          component: 'Input',
          defaultValue: 1,
          formItemClass: 'col-span-2',
          componentProps: {
            min: 1,
            max: 60,
            type: 'number',
            placeholder: $t(
              'ops.gateway.limiter.form.modal.placeholder.period',
            ),
          },
        },
        {
          label: $t('ops.gateway.limiter.form.modal.ttl'),
          fieldName: 'ttl',
          component: 'Input',
          defaultValue: 60,
          rules: 'required',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'number',
            placeholder: $t('ops.gateway.limiter.form.modal.placeholder.ttl'),
          },
        },
        {
          label: $t('ops.gateway.limiter.form.modal.enabled'),
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
          label: $t('ops.gateway.limiter.form.modal.message'),
          fieldName: 'message',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t(
              'ops.gateway.limiter.form.modal.placeholder.message',
            ),
          },
        },
      ],
    },
  };
};
