import type { CrudSchema } from '#/components/crud/components/types';

import { MemberTagService } from '#/api/member';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: MemberTagService.list,
      add: MemberTagService.create,
      edit: MemberTagService.update as any,
      remove: MemberTagService.remove,
      batchRemove: MemberTagService.remove as any,
      view: MemberTagService.get,
    },
    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: false,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'member:tag:create',
      edit: 'member:tag:update',
      remove: 'member:tag:delete',
      view: 'member:tag:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'name',
        title: $t('member.tag.table.columns.name'),
        minWidth: 150,
        align: 'left',
      },
      {
        field: 'description',
        title: $t('member.tag.table.columns.description'),
        minWidth: 200,
        align: 'left',
      },
      {
        field: 'member_count',
        title: $t('member.tag.table.columns.member_count'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'enabled',
        title: $t('member.tag.table.columns.enabled'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ENABLED_STATUS },
        },
      },
      {
        field: 'created_at',
        title: $t('member.tag.table.columns.created_at'),
        minWidth: 160,
        align: 'center',
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
          fieldName: 'LINK_name',
          label: $t('member.tag.table.search.name'),
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_enabled',
          label: $t('member.tag.table.search.enabled'),
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true,
          },
        },
      ],
    },
    formDialog: {
      enabled: true,
      title: $t('member.tag.title'),
      width: 'w-[40%]',
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
          fieldName: 'name',
          label: $t('member.tag.form.name'),
          component: 'Input',
          rules: 'required',
        },
        {
          fieldName: 'enabled',
          label: $t('member.tag.form.enabled'),
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            renderType: 'RadioGroup',
            isBtn: true,
          },
        },
        {
          fieldName: 'description',
          label: $t('member.tag.form.description'),
          component: 'Textarea',
          componentProps: { rows: 4 },
        },
      ],
    },
  };
};
