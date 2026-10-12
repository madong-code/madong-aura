import type { CrudSchema } from '#/components/crud/components/types';

import { MemberPointsService } from '#/api/member';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: MemberPointsService.list,
      add: MemberPointsService.create,
      edit: MemberPointsService.update as any,
      remove: MemberPointsService.remove as any,
      batchRemove: MemberPointsService.remove as any,
      view: MemberPointsService.get,
    },
    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: false,
    hasView: true,
    hasRemove: false,
    permissions: { add: 'member:points:create', view: 'member:points:read' },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'member.username',
        title: $t('member.points.table.columns.username'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'member.nickname',
        title: $t('member.points.table.columns.nickname'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'type',
        title: $t('member.points.table.columns.type'),
        width: 100,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.MEMBER_POINT_TYPE },
        },
      },
      {
        field: 'points',
        title: $t('member.points.table.columns.points'),
        width: 100,
        align: 'left',
        formatter: ({ cellValue }: any) =>
          cellValue !== null && cellValue !== undefined
            ? Number(cellValue).toLocaleString()
            : '',
      },
      {
        field: 'balance',
        title: $t('member.points.table.columns.balance'),
        width: 120,
        align: 'left',
        formatter: ({ cellValue }: any) =>
          cellValue !== null && cellValue !== undefined
            ? Number(cellValue).toLocaleString()
            : '',
      },
      {
        field: 'source',
        title: $t('member.points.table.columns.source'),
        minWidth: 150,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.MEMBER_POINT_SOURCE },
        },
      },
      {
        field: 'remark',
        title: $t('member.points.table.columns.remark'),
        minWidth: 200,
        align: 'left',
        visible: false,
      },
      {
        field: 'created_at',
        title: $t('member.points.table.columns.create_time'),
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
          fieldName: 'username',
          label: $t('member.points.table.search.username'),
        },
        {
          component: 'Input',
          fieldName: 'nickname',
          label: $t('member.points.table.search.nickname'),
        },
        {
          component: 'ApiDict',
          fieldName: 'type',
          label: $t('member.points.table.search.type'),
          componentProps: { code: DictEnum.MEMBER_POINT_TYPE, clearable: true },
        },
        {
          component: 'DatePicker',
          fieldName: 'date_range',
          label: $t('member.points.table.search.date_range'),
          componentProps: { type: 'daterange' },
        },
      ],
    },
    formDialog: {
      enabled: true,
      title: $t('member.points.title'),
      width: 'w-[40%]',
      wrapperClass: 'grid-cols-1',
      commonConfig: { labelWidth: 120 },
      schema: [
        {
          fieldName: 'member_id',
          label: $t('member.points.form.member_id'),
          component: 'ApiSelect',
          rules: 'required',
          componentProps: {
            api: '/member/user',
            requestMethod: 'get',
            params: { format: 'select' },
          },
        },
        {
          fieldName: 'type',
          label: $t('member.points.form.type'),
          component: 'ApiDict',
          rules: 'required',
          componentProps: { code: DictEnum.MEMBER_POINT_TYPE },
        },
        {
          fieldName: 'points',
          label: $t('member.points.form.points'),
          component: 'InputNumber',
          defaultValue: 0,
          rules: 'required',
          componentProps: { min: 1 },
        },
        {
          fieldName: 'source',
          label: $t('member.points.form.source'),
          component: 'ApiDict',
          rules: 'required',
          componentProps: { code: DictEnum.MEMBER_POINT_SOURCE },
        },
        {
          fieldName: 'remark',
          label: $t('member.points.form.remark'),
          component: 'Input',
          componentProps: { type: 'textarea', rows: 3 },
        },
      ],
    },
  };
};
