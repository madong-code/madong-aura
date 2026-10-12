import type { CrudSchema } from '#/components/crud/components/types';

import { MessageService } from '#/api/content/message';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

const ns = 'content.message.notify';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: MessageService.list,
      add: MessageService.create as any,
      edit: MessageService.update as any,
      remove: MessageService.remove,
      batchRemove: MessageService.remove as any,
      view: MessageService.get,
    },

    // ========== 扁平化表格配置 ==========
    hasAdd: false,
    hasEdit: false,
    hasView: false,
    hasRemove: false,
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'priority',
        title: $t(`${ns}.table.columns.priority`),
        width: 70,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.SYS_MESSAGE_PRIORITY },
      },
      {
        field: 'related_id',
        title: $t(`${ns}.table.columns.related_id`),
        minWidth: 100,
      },
      {
        field: 'title',
        title: $t(`${ns}.table.columns.title`),
        minWidth: 150,
      },
      {
        field: 'content',
        title: $t(`${ns}.table.columns.content`),
        minWidth: 200,
      },
      {
        field: 'status',
        title: $t(`${ns}.table.columns.status`),
        minWidth: 80,
        viewComponent: 'ApiDict',
        viewComponentProps: { code: DictEnum.SYS_MESSAGE_STATUS },
      },
      {
        field: 'sender.real_name',
        title: $t(`${ns}.table.columns.sender`),
        minWidth: 100,
      },
      {
        field: 'created_date',
        title: $t(`${ns}.table.columns.created_date`),
        minWidth: 160,
      },
      {
        field: 'read_date',
        title: $t(`${ns}.table.columns.read_date`),
        minWidth: 160,
      },
    ],

    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'Input',
          fieldName: 'LIKE_title',
          label: $t(`${ns}.table.search.title`),
        },
        {
          component: 'Input',
          fieldName: 'LIKE_content',
          label: $t(`${ns}.table.search.content`),
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_status',
          label: $t(`${ns}.table.search.status`),
          componentProps: {
            code: DictEnum.SYS_MESSAGE_STATUS,
            clearable: true,
          },
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_priority',
          label: $t(`${ns}.table.search.priority`),
          componentProps: {
            code: DictEnum.SYS_MESSAGE_PRIORITY,
            clearable: true,
          },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t(`${ns}.title`),
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
          fieldName: 'title',
          label: $t(`${ns}.form.title`),
          component: 'Input',
          rules: 'required',
        },
        {
          fieldName: 'content',
          label: $t(`${ns}.form.content`),
          component: 'Input',
          componentProps: { type: 'textarea', rows: 6 },
        },
        {
          fieldName: 'status',
          label: $t(`${ns}.form.status`),
          component: 'ApiDict',
          defaultValue: 0,
          componentProps: {
            code: DictEnum.SYS_MESSAGE_STATUS,
            renderType: 'RadioGroup',
            isBtn: true,
          },
        },
        {
          fieldName: 'priority',
          label: $t(`${ns}.form.priority`),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_MESSAGE_PRIORITY,
            renderType: 'RadioGroup',
            isBtn: true,
          },
        },
        {
          fieldName: 'type',
          label: $t(`${ns}.form.type`),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_MESSAGE_TYPE,
            renderType: 'RadioGroup',
            isBtn: true,
          },
        },
        {
          fieldName: 'remark',
          label: $t(`${ns}.form.remark`),
          component: 'Input',
          componentProps: { type: 'textarea', rows: 3 },
        },
      ],
    },
  };
};
