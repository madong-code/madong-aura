import type { CrudSchema } from '#/components/crud/components/types';

import { TemplateService } from '#/api/content/message/template';
import { requestClient } from '#/api/request';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

const ns = 'content.message.template';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: TemplateService.list,
      add: TemplateService.create,
      edit: TemplateService.update as any,
      remove: TemplateService.delete,
      batchRemove: (params: { ids: any[] }) =>
        requestClient.delete('/content/message/template', {
          data: params,
        }) as Promise<any>,
      view: TemplateService.get,
    },
    rowKey: 'id',
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    hasBatchRemove: true,
    checkable: true,
    border: 'none' as any,
    stripe: true,
    pagerConfig: { enabled: true, pageSize: 15 },
    permissions: {
      add: 'message:template:create',
      edit: 'message:template:update',
      remove: 'message:template:delete',
      view: 'message:template:read',
    },
    searchForm: {
      enabled: true,
      submitOnChange: true,
      schema: [
        {
          component: 'ApiDict',
          fieldName: 'EQ_type',
          label: $t(`${ns}.form.type`),
          componentProps: {
            code: DictEnum.MSG_TEMPLATE_TYPE,
            clearable: true,
          },
        },
      ],
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'type',
        title: $t(`${ns}.form.type`),
        width: 130,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.MSG_TEMPLATE_TYPE },
      },
      {
        field: 'title',
        title: $t(`${ns}.form.title`),
        minWidth: 150,
        align: 'left',
      },
      {
        field: 'enabled',
        title: $t(`${ns}.table.columns.enabled`),
        width: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ENABLED_STATUS },
        },
      },
      {
        field: 'push_rule',
        title: $t(`${ns}.form.push_rule`),
        width: 100,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.MSG_TEMPLATE_PUSH_RULE },
        },
      },
      {
        field: 'minute',
        title: $t(`${ns}.form.minute`),
        width: 140,
        align: 'right',
      },
      {
        field: 'created_at',
        title: $t(`${ns}.table.columns.created_at`),
        width: 170,
        visible: false,
        formatter: 'formatDateTime',
      },
      {
        field: 'updated_at',
        title: $t(`${ns}.table.columns.updated_at`),
        width: 170,
        formatter: 'formatDateTime',
      },
    ],
    formDialog: {
      enabled: true,
      dialogType: 'drawer',
      title: $t(`${ns}.form.dialog_title`),
      width: 'w-[50%]',
      wrapperClass: 'grid-cols-2',
      commonConfig: { labelWidth: 120, labelAlign: 'right' },
      schema: [
        {
          fieldName: 'id',
          component: 'Input',
          dependencies: {
            triggerFields: ['id'],
            show: false,
          },
        },
        {
          fieldName: 'type',
          label: $t(`${ns}.form.type`),
          component: 'ApiDict',
          rules: 'required',
          defaultValue: 'system',
          formItemClass: 'col-span-2',
          componentProps: {
            code: DictEnum.MSG_TEMPLATE_TYPE,
          },
        },
        {
          fieldName: 'template_id',
          label: $t(`${ns}.form.template_id`),
          component: 'Input',
          formItemClass: 'col-span-2',
        },
        {
          fieldName: 'title',
          label: $t(`${ns}.form.title`),
          component: 'Input',
          formItemClass: 'col-span-2',
        },
        {
          fieldName: 'content_template',
          label: $t(`${ns}.form.content_template`),
          component: 'Textarea',
          componentProps: { rows: 5 },
          formItemClass: 'col-span-2',
        },
        {
          fieldName: 'button_template',
          label: $t(`${ns}.form.button_template`),
          component: 'Textarea',
          componentProps: { rows: 2 },
          formItemClass: 'col-span-2',
          dependencies: {
            triggerFields: ['type'],
            show: (form: any) => form.type === 'system',
          },
        },
        {
          fieldName: 'url',
          label: $t(`${ns}.form.url`),
          component: 'Input',
          formItemClass: 'col-span-2',
        },
        {
          fieldName: 'uni_url',
          label: $t(`${ns}.form.uni_url`),
          component: 'Input',
          formItemClass: 'col-span-2',
        },
        {
          fieldName: 'webhook_url',
          label: $t(`${ns}.form.webhook_url`),
          component: 'Input',
          formItemClass: 'col-span-2',
        },
        {
          fieldName: 'enabled',
          label: $t(`${ns}.form.enabled`),
          component: 'ApiDict',
          defaultValue: 1,
          formItemClass: 'col-span-2',
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            renderType: 'RadioGroup',
            isBtn: true,
          },
        },
        {
          fieldName: 'push_rule',
          label: $t(`${ns}.form.push_rule`),
          component: 'ApiDict',
          defaultValue: 0,
          formItemClass: 'col-span-2',
          componentProps: {
            code: DictEnum.MSG_TEMPLATE_PUSH_RULE,
          },
        },
        {
          fieldName: 'minute',
          label: $t(`${ns}.form.minute`),
          component: 'InputNumber',
          formItemClass: 'col-span-2',
          defaultValue: 0,
          dependencies: {
            triggerFields: ['push_rule'],
            show: (form: any) => form.push_rule === 1,
          },
        },
      ],
    },
  };
};
