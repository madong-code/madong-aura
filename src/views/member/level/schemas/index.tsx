import type { CrudSchema } from '#/components/crud/components/types';

import { MemberLevelService } from '#/api/member';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: MemberLevelService.list,
      add: MemberLevelService.create,
      edit: MemberLevelService.update,
      remove: MemberLevelService.delete,
      batchRemove: MemberLevelService.remove,
      view: MemberLevelService.get,
    },
    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'member:level:create',
      edit: 'member:level:update',
      remove: 'member:level:delete',
      view: 'member:level:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'level',
        title: $t('member.level.table.columns.level'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'name',
        title: $t('member.level.table.columns.name'),
        minWidth: 200,
        align: 'left',
      },
      {
        field: 'min_points',
        title: $t('member.level.table.columns.min_points'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'discount',
        title: $t('member.level.table.columns.discount'),
        minWidth: 100,
        align: 'left',
        formatter: ({ cellValue }: any) => {
          if (cellValue === null || cellValue === undefined) return '-';
          return `${(cellValue * 100).toFixed(0)}%`;
        },
      },
      {
        field: 'member_count',
        title: $t('member.level.table.columns.member_count'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'enabled',
        title: $t('member.level.table.columns.enabled'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ENABLED_STATUS },
        },
      },
      {
        field: 'created_at',
        title: $t('member.level.table.columns.created_at'),
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
          label: $t('member.level.table.search.name'),
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_enabled',
          label: $t('member.level.table.search.enabled'),
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true,
          },
        },
      ],
    },
    formDialog: {
      enabled: true,
      title: $t('member.level.title'),
      width: 'w-[40%]',
      wrapperClass: 'grid-cols-1',
      commonConfig: { labelWidth: 120 },
      schema: [
        {
          fieldName: 'id',
          label: $t('member.level.form.id'),
          component: 'Input',
          dependencies: { show: false, triggerFields: ['id'] },
        },
        {
          fieldName: 'name',
          label: $t('member.level.form.name'),
          component: 'Input',
          rules: 'required',
        },
        {
          fieldName: 'level',
          label: $t('member.level.form.level'),
          component: 'InputNumber',
          defaultValue: 1,
          rules: 'required',
          componentProps: { min: 1, max: 9999 },
        },
        {
          fieldName: 'min_points',
          label: $t('member.level.form.min_points'),
          component: 'InputNumber',
          rules: 'required',
          componentProps: { min: 0 },
        },
        {
          fieldName: 'discount',
          label: $t('member.level.form.discount'),
          component: 'InputNumber',
          rules: 'required',
          componentProps: { min: 0, max: 100 },
        },
        {
          fieldName: 'icon',
          label: $t('member.level.form.icon'),
          component: 'IconPicker',
        },
        {
          fieldName: 'enabled',
          label: $t('member.level.form.enabled'),
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
          label: $t('member.level.form.description'),
          component: 'Input',
          componentProps: { type: 'textarea', rows: 3 },
        },
      ],
    },
  };
};
