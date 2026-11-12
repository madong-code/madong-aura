import type { CrudSchema } from '#/components/crud/components/types';

import { UserService } from '#/api/system/user';
import { roleSelectorConfig } from '#/views/system/user/configs/role-selector-config';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: UserService.list,
      add: UserService.create,
      edit: UserService.update,
      remove: UserService.delete,
      batchRemove: UserService.remove,
      view: UserService.get,
    },

    // ========== 扁平化表格配置 ==========
    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,
    permissions: {
      add: 'system:admin:create',
      edit: 'system:admin:update',
      remove: 'system:admin:delete',
      view: 'system:admin:read',
    },
    columns: () => [
      { type: 'checkbox', width: 60 },
      {
        field: 'user_name',
        title: $t('system.user.table.columns.user_name'),
        minWidth: 80,
        align: 'left',
      },
      {
        field: 'real_name',
        title: $t('system.user.table.columns.real_name'),
        minWidth: 130,
        align: 'left',
      },
      {
        field: 'main_dept_name',
        title: $t('system.user.table.columns.dept'),
        minWidth: 120,
        align: 'left',
        cellRender: {
          name: 'CellTags',
          attrs: { color: 'primary', labelKey: '' },
        },
      },
      {
        field: 'main_post_name',
        title: $t('system.user.table.columns.post'),
        minWidth: 120,
        align: 'left',
        cellRender: {
          name: 'CellTags',
          attrs: { color: 'success', labelKey: '' },
        },
      },
      {
        field: 'depts',
        visible: false,
        title: $t('system.user.table.columns.depts'),
        minWidth: 180,
        cellRender: { name: 'CellTags', attrs: { color: 'primary' } },
        align: 'left',
      },
      {
        field: 'posts',
        visible: false,
        title: $t('system.user.table.columns.posts'),
        minWidth: 180,
        cellRender: { name: 'CellTags', attrs: { color: 'success' } },
        align: 'left',
      },
      {
        field: 'roles',
        title: $t('system.user.table.columns.roles'),
        minWidth: 180,
        cellRender: { name: 'CellTags', attrs: { color: 'warning' } },
        align: 'left',
      },
      {
        field: 'mobile_phone',
        title: $t('system.user.table.columns.mobile_phone'),
        minWidth: 120,
      },
      {
        field: 'enabled',
        title: $t('system.user.table.columns.enabled'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ENABLED_STATUS },
        },
      },
      {
        field: 'is_locked',
        title: $t('system.user.table.columns.is_locked'),
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_LOCKED_STATUS },
        },
      },
    ],

    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'Input',
          fieldName: 'LIKE_user_name',
          label: $t('system.user.table.search.user_name'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.user.table.search.placeholder.user_name'),
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_real_name',
          label: $t('system.user.table.search.real_name'),
          componentProps: {
            clearable: true,
            placeholder: $t('system.user.table.search.placeholder.real_name'),
          },
        },
        {
          component: 'Input',
          fieldName: 'LIKE_mobile_phone',
          label: $t('system.user.table.search.mobile_phone'),
          componentProps: {
            clearable: true,
            placeholder: $t(
              'system.user.table.search.placeholder.mobile_phone',
            ),
          },
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_is_locked',
          label: $t('system.user.table.search.is_locked'),
          componentProps: {
            clearable: true,
            code: 'yes_no',
            placeholder: $t('system.user.table.search.placeholder.is_locked'),
          },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: $t('system.user.title'),
      width: 'w-[50%]',
      dialogType: 'drawer',
      wrapperClass: 'grid-cols-2',
      commonConfig: {
        labelWidth: 100,
        labelAlign: 'right',
      },
      schema: [
        {
          label: $t('system.user.form.id'),
          fieldName: 'id',
          component: 'Input',
          formItemClass: 'col-span-1',
          dependencies: { triggerFields: ['id'], show: false },
        },
        {
          fieldName: 'baseinfo',
          label: '',
          component: 'Divider',
          formItemClass: 'col-span-2 w-full',
          hideLabel: true,
          componentProps: {
            title: $t('system.user.form.base_info'),
          },
        },
        {
          label: $t('system.user.form.user_name'),
          fieldName: 'user_name',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-1',
          componentProps: {
            placeholder: $t('system.user.form.placeholder.user_name'),
          },
        },
        {
          label: $t('system.user.form.password'),
          fieldName: 'password',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-1',
          dependencies: {
            triggerFields: ['id'],
            if(values) {
              return values.id === undefined;
            },
          },
          componentProps: {
            type: 'password',
            showPassword: true,
            placeholder: $t('system.user.form.placeholder.password'),
          },
        },
        {
          label: $t('system.user.form.real_name'),
          fieldName: 'real_name',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-1',
          componentProps: {
            placeholder: $t('system.user.form.placeholder.real_name'),
          },
        },
        {
          label: $t('system.user.form.mobile_phone'),
          fieldName: 'mobile_phone',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-1',
          componentProps: {
            placeholder: $t('system.user.form.placeholder.mobile_phone'),
          },
        },
        {
          label: $t('system.user.form.email'),
          fieldName: 'email',
          component: 'Input',
          rules: 'required',
          formItemClass: 'col-span-1',
          componentProps: {
            placeholder: $t('system.user.form.placeholder.email'),
          },
        },
        {
          label: $t('system.user.form.sex'),
          fieldName: 'sex',
          component: 'ApiDict',
          defaultValue: 0,
          formItemClass: 'col-span-1',
          componentProps: {
            code: DictEnum.SYS_SEX,
            renderType: 'RadioGroup',
            isBtn: true,
          },
        },

        {
          fieldName: 'outherinfo',
          label: '',
          component: 'Divider',
          formItemClass: 'col-span-2 w-full',
          hideLabel: true,
          componentProps: {
            title: $t('system.user.form.outher_info'),
          },
        },
        // 所属部门（EntitySelector：部门选择器，多选）
        {
          label: $t('system.user.form.dept_name'),
          fieldName: 'dept_id_list',
          component: 'EntitySelector',
          formItemClass: 'col-span-2',
          componentProps: (_values) => {
            return {
              type: 'dept',
              selectMode: 'multiple',
            };
          },
        },
        // 所属岗位（EntitySelector：职位选择器，多选；限定已选部门及其子部门；部门未选时禁用）
        {
          label: $t('system.user.form.post_name'),
          fieldName: 'post_id_list',
          defaultValue: [],
          component: 'EntitySelector',
          formItemClass: 'col-span-2',
          componentProps: (values) => {
            const deptIds = values.dept_id_list ?? [];
            return {
              type: 'post',
              selectMode: 'multiple',
              deptIds,
              disabled: deptIds.length === 0,
              placeholder: deptIds.length > 0 ? '选择职位' : '请先选择所属部门',
            };
          },
        },
        // 主要部门（EntitySelector：部门选择器，单选）
        {
          label: $t('system.user.form.main_dept_name'),
          fieldName: 'main_dept_id',
          component: 'EntitySelector',
          formItemClass: 'col-span-2',
          componentProps: (_values) => {
            return {
              type: 'dept',
            };
          },
        },
        // 主要岗位（EntitySelector：职位选择器，单选；限定主要部门及其子部门；部门未选时禁用）
        {
          label: $t('system.user.form.main_post_name'),
          fieldName: 'main_post_id',
          component: 'EntitySelector',
          formItemClass: 'col-span-2',
          componentProps: (values) => {
            return {
              type: 'post',
              deptIds: values.main_dept_id ? [values.main_dept_id] : [],
              disabled: !values.main_dept_id,
              placeholder: values.main_dept_id ? '选择职位' : '请先选择主要部门',
            };
          },
        },

        // 所属角色（EntitySelector：角色选择器，多选；传参模式：配置文件整体注入 componentProps.config，
        // fetcher/hydrate 为字符串 API 路径，组件边界自动归一化，免 registerEntityPickerConfig 预注册）
        {
          label: $t('system.user.form.role_name'),
          fieldName: 'role_id_list',
          component: 'EntitySelector',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'role',
            selectMode: 'multiple',
            config: roleSelectorConfig,
          },
        },
        {
          label: $t('system.user.form.avatar'),
          fieldName: 'avatar',
          component: 'Avatar',
          formItemClass: 'col-span-2',
          componentProps: {},
        },
        {
          label: $t('system.user.form.remark'),
          fieldName: 'remark',
          component: 'Input',
          formItemClass: 'col-span-2',
          componentProps: {
            type: 'textarea',
            rows: 4,
            placeholder: $t('system.user.form.placeholder.remark'),
          },
        },
      ],
    },
  };
};
