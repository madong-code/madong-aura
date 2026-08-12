import type { CrudSchema } from '#/components/crud/components/types';

import { MemberService } from '#/api/member';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: MemberService.list,
      add: MemberService.create,
      edit: MemberService.update,
      remove: MemberService.delete,
      batchRemove: MemberService.remove,
      view: MemberService.get,
    },
    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'member:user:create',
      edit: 'member:user:update',
      remove: 'member:user:delete',
      view: 'member:user:read',
    },
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'username',
        title: $t('member.user.table.columns.username'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'nickname',
        title: $t('member.user.table.columns.nickname'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'phone',
        title: $t('member.user.table.columns.phone'),
        minWidth: 120,
        align: 'left',
      },
      {
        field: 'email',
        title: $t('member.user.table.columns.email'),
        minWidth: 150,
        align: 'left',
      },
      {
        field: 'level.name',
        title: $t('member.user.table.columns.level_name'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'points',
        title: $t('member.user.table.columns.points'),
        minWidth: 100,
        align: 'left',
      },
      {
        field: 'enabled',
        title: $t('member.user.table.columns.enabled'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ENABLED_STATUS },
        },
      },
      {
        field: 'created_at',
        title: $t('member.user.table.columns.created_at'),
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
          label: $t('member.user.table.search.username'),
        },
        {
          component: 'Input',
          fieldName: 'nickname',
          label: $t('member.user.table.search.nickname'),
        },
        {
          component: 'Input',
          fieldName: 'phone',
          label: $t('member.user.table.search.phone'),
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_enabled',
          label: $t('member.user.table.search.enabled'),
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            clearable: true,
          },
        },
      ],
    },
    formDialog: {
      enabled: true,
      title: $t('member.user.title'),
      width: 'w-[50%]',
      wrapperClass: 'grid-cols-2',
      commonConfig: { labelWidth: 100 },
      schema: [
        {
          fieldName: 'id',
          label: 'ID',
          component: 'Input',
          dependencies: {
            triggerFields: ['id'],
            show: false,
          },
        },
        {
          fieldName: 'username',
          label: $t('member.user.form.username'),
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-2',
        },
        {
          fieldName: 'password',
          label: $t('member.user.form.password'),
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: { type: 'password' },
          dependencies: {
            triggerFields: ['id'],
            if(v: any) {
              return !v.id;
            },
          },
        },
        {
          fieldName: 'nickname',
          label: $t('member.user.form.nickname'),
          component: 'Input',
          formItemClass: 'col-span-2',
        },
        {
          fieldName: 'phone',
          label: $t('member.user.form.phone'),
          component: 'Input',
          formItemClass: 'col-span-2',
          rules: 'required',
        },
        {
          fieldName: 'email',
          label: $t('member.user.form.email'),
          component: 'Input',
          formItemClass: 'col-span-2',
        },
        {
          fieldName: 'level_id',
          label: $t('member.user.form.level_id'),
          component: 'ApiSelect',
          formItemClass: 'col-span-2',
          componentProps: {
            api: '/member/level',
            requestMethod: 'get',
            params: { format: 'select' },
          },
        },
        {
          fieldName: 'enabled',
          label: $t('member.user.form.enabled'),
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
          fieldName: 'remark',
          label: $t('member.user.form.remark'),
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: { type: 'textarea', rows: 3 },
        },
      ],
    },
  };
};
